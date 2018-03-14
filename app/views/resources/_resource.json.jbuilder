json.extract! resource, :id, :title, :description, :url, :youtube_link, :external_links, :created_at, :updated_at
json.url resource_url(resource, format: :json)
