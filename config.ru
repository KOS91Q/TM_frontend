use Rack::Static,
  :urls => %w[/images /js /css /favicon.ico],
  :root => "public"

use Rack::Static,
  :urls => {"/oauth2/redirect" => "/oauth2/redirect/index.html"},
  :root => "public"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('public/index.html', File::RDONLY),
  ]
}
