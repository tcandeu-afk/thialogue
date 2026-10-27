require 'webrick'
require 'net/http'
require 'uri'
require 'json'
require 'cgi'

root = File.expand_path('/Users/tcandeu/.gemini/antigravity/scratch/storyflow-reader')
preview_path = File.join(root, 'preview.html')
settings_file = File.join(root, '.shared_settings.json')

tts_cache = {}

server = WEBrick::HTTPServer.new(
  Port: 8080,
  BindAddress: '0.0.0.0',
  AccessLog: [[$stderr, WEBrick::AccessLog::COMMON_LOG_FORMAT]],
  Logger: WEBrick::Log.new($stderr, WEBrick::Log::INFO)
)

# 1. Shared API Key Sync endpoint so opening on Phone automatically gets Mac's API keys
server.mount_proc '/api/settings' do |req, res|
  res['Access-Control-Allow-Origin'] = '*'
  res['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  res['Access-Control-Allow-Headers'] = 'Content-Type'
  res['Content-Type'] = 'application/json; charset=utf-8'
  res['Cache-Control'] = 'no-store'

  if req.request_method == 'OPTIONS'
    res.status = 200
    res.body = '{}'
  elsif req.request_method == 'POST'
    begin
      incoming = JSON.parse(req.body.to_s)
      existing = File.file?(settings_file) ? JSON.parse(File.read(settings_file)) : {}
      merged = existing.merge(incoming.select { |_k, v| v.is_a?(String) && !v.strip.empty? })
      File.write(settings_file, JSON.pretty_generate(merged))
      res.status = 200
      res.body = JSON.generate(merged)
    rescue => e
      res.status = 400
      res.body = JSON.generate({ error: e.message })
    end
  else
    if File.file?(settings_file)
      res.status = 200
      res.body = File.read(settings_file)
    else
      res.status = 200
      res.body = '{}'
    end
  end
end

# 1b. ElevenLabs Proxy endpoint (/api/elevenlabs) to bypass iOS/Safari content-blocker or CORS "Load failed" errors
server.mount_proc '/api/elevenlabs' do |req, res|
  res['Access-Control-Allow-Origin'] = '*'
  res['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
  res['Access-Control-Allow-Headers'] = 'Content-Type'

  if req.request_method == 'OPTIONS'
    res.status = 200
    res.body = ''
    next
  end

  begin
    raw_body = req.body.to_s.dup.force_encoding('UTF-8')
    body = JSON.parse(raw_body)
    api_key = body['apiKey'].to_s.dup.force_encoding('UTF-8').strip
    voice_id = body['voiceId'].to_s.dup.force_encoding('UTF-8').strip
    text = body['text'].to_s.dup.force_encoding('UTF-8')
    model_id = (body['modelId'] || 'eleven_multilingual_v2').to_s.dup.force_encoding('UTF-8')

    payload_file = "/tmp/el_req_#{Process.pid}_#{rand(1_000_000)}.json"
    out_file = "/tmp/el_out_#{Process.pid}_#{rand(1_000_000)}.mp3"
    File.binwrite(payload_file, JSON.generate({
      text: text,
      model_id: model_id,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    }))

    url = "https://api.elevenlabs.io/v1/text-to-speech/#{CGI.escape(voice_id)}?output_format=mp3_44100_128"
    http_code = IO.popen([
      '/usr/bin/curl', '-sS', '-w', '%{http_code}',
      '-X', 'POST', url,
      '-H', 'Accept: audio/mpeg',
      '-H', 'Content-Type: application/json',
      '-H', "xi-api-key: #{api_key}",
      '--data-binary', "@#{payload_file}",
      '-o', out_file
    ], &:read).to_s.strip

    File.delete(payload_file) rescue nil

    if http_code == '200' && File.file?(out_file) && File.size(out_file) > 0
      mp3_data = File.binread(out_file)
      File.delete(out_file) rescue nil
      res.status = 200
      res['Content-Type'] = 'audio/mpeg'
      res['Content-Length'] = mp3_data.bytesize.to_s
      res.body = mp3_data
    else
      err_body = File.file?(out_file) ? File.binread(out_file).force_encoding('UTF-8') : 'ElevenLabs request failed'
      File.delete(out_file) rescue nil
      res.status = (http_code.to_i >= 400 ? http_code.to_i : 502)
      res['Content-Type'] = 'application/json'
      res.body = err_body
    end
  rescue => e
    res.status = 500
    res['Content-Type'] = 'application/json'
    res.body = JSON.generate({ detail: e.message })
  end
end

# 1c. Synchronous HTML5 <audio> Streaming endpoint (/api/elevenlabs-stream?key=...&voiceId=...&chapterId=...&text=...)
# Allows `<audio>` to call `el.play()` synchronously inside the user's click gesture (zero async gap!).
# Caches the MP3 on disk (`audio/el_<chapterId>_<voiceId>.mp3`) so subsequent plays are instant,
# and automatically serves the pre-rendered chapter `.wav` if ElevenLabs returns an error!
server.mount_proc '/api/elevenlabs-stream' do |req, res|
  res['Access-Control-Allow-Origin'] = '*'
  params = req.query || {}
  api_key = (params['key'] || '').to_s.dup.force_encoding('UTF-8').strip
  voice_id = (params['voiceId'] || 'JBFqnCBsd6RMkjVDRZzb').to_s.dup.force_encoding('UTF-8').strip
  chapter_id = (params['chapterId'] || 'ch').to_s.dup.force_encoding('UTF-8').gsub(/[^a-zA-Z0-9_\-]/, '')
  text = (params['text'] || '').to_s.dup.force_encoding('UTF-8').strip

  safe_voice = voice_id.gsub(/[^a-zA-Z0-9]/, '')
  cached_mp3_path = File.join(root, 'audio', "el_#{chapter_id}_#{safe_voice}.mp3")

  if File.file?(cached_mp3_path) && File.size(cached_mp3_path) > 256
    mp3_bytes = File.binread(cached_mp3_path)
    res.status = 200
    res['Content-Type'] = 'audio/mpeg'
    res['Content-Length'] = mp3_bytes.bytesize.to_s
    res['Accept-Ranges'] = 'bytes'
    res.body = mp3_bytes
    next
  end

  if !api_key.empty? && !text.empty?
    begin
      payload_file = "/tmp/el_stream_req_#{Process.pid}_#{rand(1_000_000)}.json"
      out_file = "/tmp/el_stream_out_#{Process.pid}_#{rand(1_000_000)}.mp3"
      File.binwrite(payload_file, JSON.generate({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }))

      url = "https://api.elevenlabs.io/v1/text-to-speech/#{CGI.escape(voice_id)}?output_format=mp3_44100_128"
      http_code = IO.popen([
        '/usr/bin/curl', '-sS', '--max-time', '14', '-w', '%{http_code}',
        '-X', 'POST', url,
        '-H', 'Accept: audio/mpeg',
        '-H', 'Content-Type: application/json',
        '-H', "xi-api-key: #{api_key}",
        '--data-binary', "@#{payload_file}",
        '-o', out_file
      ], &:read).to_s.strip

      File.delete(payload_file) rescue nil

      if http_code == '200' && File.file?(out_file) && File.size(out_file) > 256
        mp3_bytes = File.binread(out_file)
        File.binwrite(cached_mp3_path, mp3_bytes) rescue nil
        File.delete(out_file) rescue nil
        $stderr.puts "ElevenLabs stream OK for #{chapter_id} (#{mp3_bytes.bytesize} bytes)"
        res.status = 200
        res['Content-Type'] = 'audio/mpeg'
        res['Content-Length'] = mp3_bytes.bytesize.to_s
        res['Accept-Ranges'] = 'bytes'
        res.body = mp3_bytes
        next
      else
        err_msg = File.file?(out_file) ? File.binread(out_file).force_encoding('UTF-8')[0, 300] : 'no response'
        File.delete(out_file) rescue nil
        $stderr.puts "ElevenLabs HTTP #{http_code} for #{chapter_id}: #{err_msg}"
      end
    rescue => e
      $stderr.puts "ElevenLabs stream exception: #{e.message}"
    end
  end

  # Fallback: return HTTP 502 so `<audio onError>` immediately switches to `audio/<chapterId>.wav`
  res.status = 502
  res['Content-Type'] = 'text/plain'
  res.body = 'ElevenLabs unavailable'
end

# 2. Local Native WAV TTS endpoint (/api/tts?tl=fr&q=bonjour)
# Synthesizes crystal-clear audio locally via macOS /usr/bin/say so it works 100% offline/without SSL!
VOICE_MAP = {
  'fr' => 'Thomas',
  'it' => 'Alice',
  'es' => 'Mónica',
  'ko' => 'Yuna',
  'ja' => 'Kyoko',
  'th' => 'Kanya',
  'en' => 'Samantha'
}.freeze

server.mount_proc '/api/tts' do |req, res|
  res['Access-Control-Allow-Origin'] = '*'
  params = req.query || {}
  tl = (params['tl'] || 'fr').to_s.dup.force_encoding('UTF-8').split('-').first.strip.downcase
  q = (params['q'] || '').to_s.dup.force_encoding('UTF-8').strip

  if q.empty?
    res.status = 400
    res.body = 'Missing q'
    next
  end

  cache_key = "#{tl}:#{q}"
  wav_bytes = tts_cache[cache_key]

  unless wav_bytes
    begin
      voice = VOICE_MAP[tl] || 'Thomas'
      tmp_wav = "/tmp/tts_#{Process.pid}_#{ rand(1_000_000) }.wav"
      system('/usr/bin/say', '-v', voice, '-r', '155', '--data-format=LEI16@16000', '-o', tmp_wav, q)
      if File.file?(tmp_wav) && File.size(tmp_wav) > 0
        wav_bytes = File.binread(tmp_wav)
        File.delete(tmp_wav) rescue nil
        tts_cache[cache_key] = wav_bytes if tts_cache.size < 500
      end
    rescue => e
      $stderr.puts "Local TTS error: #{e.message}"
    end
  end

  if wav_bytes
    res['Content-Type'] = 'audio/wav'
    res['Content-Length'] = wav_bytes.bytesize.to_s
    res['Accept-Ranges'] = 'bytes'
    res['Cache-Control'] = 'public, max-age=86400'
    res.body = wav_bytes
  else
    res.status = 502
    res.body = 'TTS unavailable'
  end
end

# 3. Serve preview.html at / and /preview.html, plus /audio/*.wav
server.mount_proc '/' do |req, res|
  res['Access-Control-Allow-Origin'] = '*'
  target = req.path == '/' || req.path == '/preview.html' ? preview_path : File.join(root, req.path)
  if File.file?(target)
    ext = File.extname(target).downcase
    res['Content-Type'] = case ext
                          when '.html' then 'text/html; charset=utf-8'
                          when '.js', '.jsx' then 'application/javascript; charset=utf-8'
                          when '.css' then 'text/css; charset=utf-8'
                          when '.wav' then 'audio/wav'
                          when '.mp3' then 'audio/mpeg'
                          else 'application/octet-stream'
                          end
    res['Accept-Ranges'] = 'bytes' if ext == '.wav' || ext == '.mp3'
    res['Cache-Control'] = ext == '.wav' ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate'
    res.body = File.binread(target)
  else
    res.status = 404
    res.body = 'Not found'
  end
end

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
server.start
