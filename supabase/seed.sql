insert into scales (category, name, sort_order) values
  ('lego', 'Minifig scale', 1),
  ('lego', 'Large scale (modular)', 2),
  ('lego', 'Microscale', 3),
  ('gundam', 'HG 1/144', 1),
  ('gundam', 'RG 1/144', 2),
  ('gundam', 'MG 1/100', 3),
  ('cars', '1:64', 1),
  ('cars', '1:43', 2),
  ('cars', '1:18', 3);

insert into themes (name) values
  ('Urban street scene'),
  ('Post-apocalyptic'),
  ('Desert outpost'),
  ('Neon cyberpunk'),
  ('Forest hideout');

insert into tags (name) values
  ('night'), ('rain'), ('snow'), ('workshop');

insert into dioramas (title, category, scale_id, theme_id, pov, realism, era, tags, prompt, negative_prompt, model, seed, images, source, is_favourite)
select
  v.title, v.category,
  (select id from scales where category = v.category order by sort_order limit 1),
  (select id from themes where name = v.theme),
  v.pov, v.realism, v.era, v.tags::jsonb,
  v.prompt, v.negative_prompt, v.model, v.seed,
  jsonb_build_array(jsonb_build_object('angle', 'front', 'url', v.image_url)),
  'generated', v.is_favourite
from (values
  ('Midnight brick alley', 'lego', 'Urban street scene', 'eye-level', 'photoreal', 'near-future', '["night","rain"]',
   'A minifig scale LEGO diorama of an urban street scene...', 'blurry, watermark', 'flux-pro', 101,
   'https://picsum.photos/seed/lego1/800/600', true),
  ('Wasteland convoy', 'lego', 'Post-apocalyptic', 'low-angle', 'stylized', 'post-collapse', '["workshop"]',
   'A large scale LEGO diorama of a post-apocalyptic convoy...', 'blurry, watermark', 'flux-pro', 102,
   'https://picsum.photos/seed/lego2/800/600', false),
  ('Desert mech outpost', 'gundam', 'Desert outpost', 'eye-level', 'photoreal', 'far-future', '["workshop"]',
   'A HG 1/144 Gundam diorama of a desert outpost...', 'blurry, watermark', 'flux-pro', 201,
   'https://picsum.photos/seed/gundam1/800/600', true),
  ('Neon city skirmish', 'gundam', 'Neon cyberpunk', 'low-angle', 'stylized', 'near-future', '["night"]',
   'A RG 1/144 Gundam diorama of a neon cyberpunk skirmish...', 'blurry, watermark', 'flux-pro', 202,
   'https://picsum.photos/seed/gundam2/800/600', false),
  ('Rally car in the snow', 'cars', 'Forest hideout', 'eye-level', 'photoreal', 'modern', '["snow"]',
   'A 1:64 scale diecast diorama of a rally car in a forest hideout...', 'blurry, watermark', 'flux-pro', 301,
   'https://picsum.photos/seed/cars1/800/600', true),
  ('Garage night build', 'cars', 'Urban street scene', 'low-angle', 'photoreal', 'modern', '["night","workshop"]',
   'A 1:43 scale diecast diorama of a garage night build...', 'blurry, watermark', 'flux-pro', 302,
   'https://picsum.photos/seed/cars2/800/600', false)
) as v(title, category, theme, pov, realism, era, tags, prompt, negative_prompt, model, seed, image_url, is_favourite);

insert into boards (name, description) values ('Favourites', 'Best of each category');

insert into board_dioramas (board_id, diorama_id, position)
select (select id from boards where name = 'Favourites'), id, row_number() over (order by created_at)
from dioramas where is_favourite = true;
