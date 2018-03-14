class CreateResources < ActiveRecord::Migration[5.1]
  def change
    create_table :resources do |t|
      t.string :title
      t.text :description
      t.string :url
      t.string :youtube_link
      t.text :external_links

      t.timestamps
    end
  end
end
