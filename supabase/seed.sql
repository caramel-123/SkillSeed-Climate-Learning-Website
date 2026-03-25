-- SkillSeed Demo Seed Data
-- Run this after creating the schema migration
-- =============================================================================

-- =============================================================================
-- DISABLE FOREIGN KEY CONSTRAINTS FOR DEMO DATA
-- =============================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_poster_id_fkey;
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_poster_id_fkey;
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_responder_id_fkey;
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_project_id_fkey;

-- =============================================================================
-- DEMO PROFILES
-- =============================================================================

-- Demo Responder Profiles (volunteers/professionals)
INSERT INTO public.profiles (id, user_id, name, org_name, org_type, role_type, bio, location, availability, skills, verified, credentials_url, avatar_url) VALUES
-- Verified Professionals
('11111111-1111-1111-1111-111111111111', '11111111-0000-0000-0000-000000000001', 
 'Dr. Sarah Chen', 'Stanford Climate Lab', 'academic', 'professional',
 'Climate scientist with 10+ years experience in carbon sequestration research and policy development.',
 'San Francisco, CA', 'part-time',
 ARRAY['climate science', 'data analysis', 'research', 'policy development', 'carbon accounting'],
 true, 'https://linkedin.com/in/sarahchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),

('11111111-1111-1111-1111-111111111112', '11111111-0000-0000-0000-000000000002',
 'Marcus Johnson', 'Green Energy Solutions', 'private', 'professional',
 'Renewable energy engineer specializing in solar and wind installations for underserved communities.',
 'Austin, TX', 'full-time',
 ARRAY['renewable energy', 'solar installation', 'project management', 'community engagement', 'electrical engineering'],
 true, 'https://linkedin.com/in/marcusjohnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'),

('11111111-1111-1111-1111-111111111113', '11111111-0000-0000-0000-000000000003',
 'Aisha Patel', 'EcoDesign Studio', 'private', 'professional',
 'UX designer passionate about creating accessible climate education platforms and environmental apps.',
 'New York, NY', 'flexible',
 ARRAY['UX design', 'UI design', 'user research', 'accessibility', 'prototyping', 'figma'],
 true, 'https://aishapatel.design', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha'),

('11111111-1111-1111-1111-111111111114', '11111111-0000-0000-0000-000000000004',
 'Dr. James Okonkwo', 'African Climate Foundation', 'nonprofit', 'professional',
 'Environmental economist focusing on climate finance and green investment strategies for Africa.',
 'Lagos, Nigeria', 'part-time',
 ARRAY['climate finance', 'economics', 'policy development', 'grant writing', 'stakeholder management'],
 true, 'https://linkedin.com/in/jamesokonkwo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'),

('11111111-1111-1111-1111-111111111115', '11111111-0000-0000-0000-000000000005',
 'Emma Rodriguez', 'City of Seattle', 'government', 'professional',
 'Urban planner specializing in green infrastructure and climate-resilient city design.',
 'Seattle, WA', 'weekends',
 ARRAY['urban planning', 'GIS mapping', 'green infrastructure', 'stakeholder management', 'community engagement'],
 true, 'https://linkedin.com/in/emmarodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'),

-- Verified Volunteers
('11111111-1111-1111-1111-111111111116', '11111111-0000-0000-0000-000000000006',
 'Tyler Brooks', NULL, NULL, 'volunteer',
 'Marketing professional volunteering to help climate organizations with communications and outreach.',
 'Denver, CO', 'weekends',
 ARRAY['social media', 'marketing', 'content creation', 'communications', 'copywriting'],
 true, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler'),

('11111111-1111-1111-1111-111111111117', '11111111-0000-0000-0000-000000000007',
 'Sofia Andersen', NULL, NULL, 'volunteer',
 'Data analyst eager to apply skills to environmental monitoring and climate impact assessment.',
 'Chicago, IL', 'flexible',
 ARRAY['data analysis', 'python', 'excel', 'visualization', 'statistics'],
 true, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'),

-- Students
('11111111-1111-1111-1111-111111111118', '11111111-0000-0000-0000-000000000008',
 'Alex Kim', 'UC Berkeley', 'academic', 'student',
 'Environmental science major seeking hands-on experience in conservation and sustainability projects.',
 'Berkeley, CA', 'part-time',
 ARRAY['research', 'field work', 'data collection', 'report writing', 'GIS mapping'],
 false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),

('11111111-1111-1111-1111-111111111119', '11111111-0000-0000-0000-000000000009',
 'Priya Sharma', 'MIT', 'academic', 'student',
 'Computer science student interested in applying ML/AI to climate modeling and prediction.',
 'Boston, MA', 'part-time',
 ARRAY['machine learning', 'python', 'data analysis', 'climate modeling', 'research'],
 false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),

('11111111-1111-1111-1111-111111111120', '11111111-0000-0000-0000-000000000010',
 'Jordan Williams', 'Howard University', 'academic', 'student',
 'Environmental justice advocate studying the intersection of climate change and social equity.',
 'Washington, DC', 'flexible',
 ARRAY['community engagement', 'research', 'advocacy', 'event planning', 'public speaking'],
 false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'),

-- Non-verified Professionals
('11111111-1111-1111-1111-111111111121', '11111111-0000-0000-0000-000000000011',
 'Michael Torres', 'Freelance', NULL, 'professional',
 'Full-stack developer interested in building climate tech applications and environmental monitoring tools.',
 'Miami, FL', 'full-time',
 ARRAY['web development', 'react', 'node.js', 'database design', 'API development'],
 false, 'https://github.com/migueltorres', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),

('11111111-1111-1111-1111-111111111122', '11111111-0000-0000-0000-000000000012',
 'Lisa Chang', 'GreenTech Consulting', 'private', 'professional',
 'Project manager with experience leading sustainability initiatives and carbon reduction programs.',
 'Portland, OR', 'part-time',
 ARRAY['project management', 'sustainability', 'carbon accounting', 'stakeholder management', 'reporting'],
 false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'),

-- More Volunteers
('11111111-1111-1111-1111-111111111123', '11111111-0000-0000-0000-000000000013',
 'David Osei', NULL, NULL, 'volunteer',
 'Photographer documenting climate impact and environmental conservation efforts worldwide.',
 'Accra, Ghana', 'flexible',
 ARRAY['photography', 'videography', 'storytelling', 'content creation', 'field work'],
 true, 'https://davidoseiphoto.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),

('11111111-1111-1111-1111-111111111124', '11111111-0000-0000-0000-000000000014',
 'Maria Santos', NULL, NULL, 'volunteer',
 'Bilingual community organizer experienced in grassroots environmental justice campaigns.',
 'Los Angeles, CA', 'weekends',
 ARRAY['community engagement', 'translation', 'event planning', 'advocacy', 'outreach'],
 true, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'),

('11111111-1111-1111-1111-111111111125', '11111111-0000-0000-0000-000000000015',
 'Hannah Mueller', NULL, NULL, 'volunteer',
 'Grant writer and fundraiser supporting environmental nonprofits and climate initiatives.',
 'Minneapolis, MN', 'part-time',
 ARRAY['grant writing', 'fundraising', 'communications', 'research', 'reporting'],
 false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah')

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- DEMO PROJECTS
-- =============================================================================

INSERT INTO public.projects (id, poster_id, title, type, focus_area, location, region, description, volunteers_needed, professionals_needed, skills_needed, status, duration, start_date, points) VALUES

-- =====================
-- URGENT PROJECTS (Philippines)
-- =====================

-- Urgent: Reforestation (Philippines)
('22222222-2222-2222-2222-222222222201', '11111111-0000-0000-0000-000000000001',
 'Urgent: Typhoon-Damaged Forest Restoration', 'urgent',
 ARRAY['reforestation', 'conservation'],
 'Sierra Madre, Quezon', 'Philippines',
 'Critical reforestation effort after Typhoon Kristine devastated 500 hectares of protected forest. We need volunteers for seedling planting and professionals for ecosystem assessment. Immediate help needed before monsoon season.',
 20, 3,
 ARRAY['tree planting', 'conservation', 'field work', 'ecology', 'project management'],
 'open', '3 months', '2026-03-15', 350),

-- Urgent: Disaster Response (Philippines)
('22222222-2222-2222-2222-222222222202', '11111111-0000-0000-0000-000000000002',
 'Urgent: Flood Relief Distribution in Mindanao', 'urgent',
 ARRAY['disaster response', 'emergency relief'],
 'Cotabato City, Mindanao', 'Philippines',
 'Immediate volunteers needed to distribute relief goods to 2,000 families affected by severe flooding. Help with packing, logistics, and community coordination required.',
 15, 2,
 ARRAY['logistics', 'community engagement', 'coordination', 'field work', 'translation'],
 'open', '2 weeks', '2026-03-10', 300),

-- =====================
-- REGULAR PROJECTS (Philippines)
-- =====================

-- Renewable Energy (Philippines)
('22222222-2222-2222-2222-222222222203', '11111111-0000-0000-0000-000000000003',
 'Solar Microgrid Installation for Island Barangays', 'project',
 ARRAY['renewable energy', 'solar'],
 'Palawan', 'Philippines',
 'Installing solar microgrids in off-grid island communities in Palawan. Seeking electrical engineers and volunteers for community training on system maintenance.',
 8, 2,
 ARRAY['solar installation', 'electrical engineering', 'community training', 'project management'],
 'open', '2 months', '2026-04-01', 280),

-- Education (Philippines)
('22222222-2222-2222-2222-222222222204', '11111111-0000-0000-0000-000000000004',
 'Climate Literacy Program for Public Schools', 'project',
 ARRAY['education', 'climate literacy'],
 'Metro Manila', 'Philippines',
 'Developing and delivering climate education modules for Grade 7-10 students in public schools. Need educators and content creators fluent in Filipino.',
 6, 2,
 ARRAY['education', 'curriculum design', 'Filipino', 'content creation', 'public speaking'],
 'open', '6 months', '2026-04-15', 250),

-- Urban Planning (Philippines)
('22222222-2222-2222-2222-222222222205', '11111111-0000-0000-0000-000000000005',
 'Urban Green Corridor Mapping - Cebu City', 'project',
 ARRAY['urban planning', 'green infrastructure'],
 'Cebu City', 'Philippines',
 'Mapping potential green corridors and urban forest sites in Cebu City to improve air quality and reduce urban heat island effect. GIS skills required.',
 4, 2,
 ARRAY['GIS mapping', 'urban planning', 'data analysis', 'field surveys', 'stakeholder engagement'],
 'open', '3 months', '2026-05-01', 220),

-- Agriculture (Philippines)
('22222222-2222-2222-2222-222222222206', '11111111-0000-0000-0000-000000000001',
 'Sustainable Rice Farming Training Program', 'project',
 ARRAY['agriculture', 'sustainable farming'],
 'Nueva Ecija', 'Philippines',
 'Training rice farmers on sustainable farming practices including alternate wetting and drying (AWD) technique to reduce methane emissions. Need agricultural experts and community trainers.',
 5, 2,
 ARRAY['agriculture', 'community training', 'field work', 'Filipino', 'project coordination'],
 'open', '4 months', '2026-04-01', 200),

-- Marine/Water (Philippines)
('22222222-2222-2222-2222-222222222207', '11111111-0000-0000-0000-000000000002',
 'Coral Reef Restoration Project - Bohol', 'project',
 ARRAY['marine conservation', 'ocean'],
 'Panglao, Bohol', 'Philippines',
 'Community-based coral reef restoration project. Training local fisherfolk in coral gardening techniques and reef monitoring. Divers and marine biologists needed.',
 10, 2,
 ARRAY['scuba diving', 'marine biology', 'community engagement', 'data collection', 'conservation'],
 'open', '6 months', '2026-05-15', 320),

-- =====================
-- REMOTE / GLOBAL PROJECTS
-- =====================

-- Climate Science (Philippines - remote work)
('22222222-2222-2222-2222-222222222208', '11111111-0000-0000-0000-000000000003',
 'Open Source Climate Data Dashboard for PAGASA', 'project',
 ARRAY['climate science', 'data analysis'],
 'Remote (Philippines-based)', 'Philippines',
 'Building an open-source dashboard visualizing Philippine climate data for PAGASA researchers and local government units. Need data scientists, developers, and climate researchers.',
 3, 3,
 ARRAY['python', 'data visualization', 'react', 'climate science', 'API development'],
 'open', '4 months', '2026-04-01', 300),

-- Policy/Finance (Philippines)
('22222222-2222-2222-2222-222222222209', '11111111-0000-0000-0000-000000000004',
 'Green Finance Assessment for Philippine LGUs', 'project',
 ARRAY['climate finance', 'policy'],
 'Makati City', 'Philippines',
 'Research project assessing climate finance readiness of local government units in the Philippines. Looking for economists, researchers, and policy analysts familiar with LGU operations.',
 2, 3,
 ARRAY['research', 'economics', 'data analysis', 'report writing', 'climate finance'],
 'open', '3 months', '2026-04-15', 350),

-- Storytelling/Media (Philippines)
('22222222-2222-2222-2222-222222222210', '11111111-0000-0000-0000-000000000005',
 'Kwentong Klima: Filipino Climate Champions', 'project',
 ARRAY['storytelling', 'media'],
 'Nationwide', 'Philippines',
 'Producing a documentary series highlighting grassroots climate champions across Philippine provinces. Need filmmakers, editors, and community coordinators fluent in Filipino dialects.',
 4, 2,
 ARRAY['videography', 'video editing', 'storytelling', 'Filipino', 'project coordination'],
 'open', '6 months', '2026-05-01', 400),

-- Community/Grassroots (Philippines)
('22222222-2222-2222-2222-222222222211', '11111111-0000-0000-0000-000000000001',
 'Kabataan Para sa Kalikasan Youth Network', 'project',
 ARRAY['community', 'grassroots organizing'],
 'Metro Manila', 'Philippines',
 'Building a network connecting young Filipino climate activists for knowledge sharing and collaborative campaigns. Need community managers, social media specialists, and event coordinators.',
 5, 2,
 ARRAY['community management', 'social media', 'event planning', 'Filipino', 'outreach'],
 'open', '4 months', '2026-04-01', 250),

-- =====================
-- INTERNATIONAL / REMOTE PROJECTS (Limited)
-- =====================

-- Global Remote Project
('22222222-2222-2222-2222-222222222212', '11111111-0000-0000-0000-000000000003',
 'Global Climate Tech Open Source Tools', 'project',
 ARRAY['technology', 'climate science'],
 'Remote', 'Global',
 'Contributing to open-source climate technology tools used worldwide. Flexible remote work for developers interested in climate impact.',
 3, 2,
 ARRAY['python', 'javascript', 'open source', 'climate modeling', 'documentation'],
 'open', '6 months', '2026-04-15', 280),

-- Southeast Asia Regional
('22222222-2222-2222-2222-222222222213', '11111111-0000-0000-0000-000000000004',
 'ASEAN Climate Adaptation Research Network', 'project',
 ARRAY['research', 'policy'],
 'Remote', 'Southeast Asia',
 'Regional research collaboration on climate adaptation strategies across ASEAN countries. Remote coordination with occasional travel to partner countries.',
 2, 3,
 ARRAY['research', 'climate adaptation', 'policy analysis', 'report writing', 'stakeholder engagement'],
 'open', '8 months', '2026-05-01', 320)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- DEMO CONNECTIONS (Sample matches/applications)
-- =============================================================================

INSERT INTO public.connections (id, project_id, poster_id, responder_id, role, message, status, match_score) VALUES

-- Accepted connections
('33333333-3333-3333-3333-333333333301',
 '22222222-2222-2222-2222-222222222201', -- Reforestation (urgent)
 '11111111-0000-0000-0000-000000000001', -- Poster
 '11111111-0000-0000-0000-000000000007', -- Sofia (data analyst)
 'volunteer',
 'I have experience with conservation projects and would love to help with reforestation efforts.',
 'accepted', 3),

('33333333-3333-3333-3333-333333333302',
 '22222222-2222-2222-2222-222222222208', -- Climate Data Dashboard
 '11111111-0000-0000-0000-000000000003', -- Poster
 '11111111-0000-0000-0000-000000000011', -- Michael (developer)
 'professional',
 'Full-stack developer with React and data viz experience. Excited about climate science!',
 'accepted', 2),

-- Pending connections
('33333333-3333-3333-3333-333333333303',
 '22222222-2222-2222-2222-222222222205', -- Urban Green Corridor Cebu
 '11111111-0000-0000-0000-000000000005', -- Poster
 '11111111-0000-0000-0000-000000000008', -- Alex (student with GIS)
 'volunteer',
 'Environmental science student with GIS experience. Would love to help map Cebu City.',
 'pending', 2),

('33333333-3333-3333-3333-333333333304',
 '22222222-2222-2222-2222-222222222210', -- Kwentong Klima Documentary
 '11111111-0000-0000-0000-000000000005', -- Poster
 '11111111-0000-0000-0000-000000000013', -- David (photographer)
 'volunteer',
 'Professional photographer with climate documentation experience. Excited about the Kwentong Klima series.',
 'pending', 4),

('33333333-3333-3333-3333-333333333305',
 '22222222-2222-2222-2222-222222222202', -- Flood Relief (urgent)
 '11111111-0000-0000-0000-000000000002', -- Poster
 '11111111-0000-0000-0000-000000000014', -- Maria (community organizer)
 'volunteer',
 'Experienced community organizer. I can help coordinate relief distribution in Mindanao.',
 'pending', 3),

-- Sample declined
('33333333-3333-3333-3333-333333333306',
 '22222222-2222-2222-2222-222222222203', -- Solar Microgrid Palawan
 '11111111-0000-0000-0000-000000000002', -- Poster
 '11111111-0000-0000-0000-000000000008', -- Alex (no electrical skills)
 'volunteer',
 'Interested in learning about solar installation.',
 'declined', 0)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- RE-ENABLE FOREIGN KEY CONSTRAINTS FOR POSTGREST RELATIONSHIPS
-- =============================================================================
-- Re-add the FK constraints so PostgREST can detect relationships for joins
-- Note: We only re-add constraints that don't reference auth.users since our
-- demo data uses fake user IDs. The project_id FK is safe to restore.

ALTER TABLE public.connections 
  ADD CONSTRAINT connections_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';


-- =============================================================================
-- USEFUL QUERIES FOR TESTING
-- =============================================================================

-- Test: Get all matched profiles for a project
-- SELECT * FROM get_matches_for_project('22222222-2222-2222-2222-222222222201');

-- Test: Get all matching projects for a user
-- SELECT * FROM get_projects_for_user('11111111-0000-0000-0000-000000000007');

-- Test: View all profiles with skills
-- SELECT name, role_type, skills, verified FROM profiles ORDER BY verified DESC;

-- Test: View all open projects
-- SELECT title, type, skills_needed, status FROM projects WHERE status = 'open';

-- Test: View connection status
-- SELECT p.title, pr.name as responder, c.status, c.match_score 
-- FROM connections c 
-- JOIN projects p ON c.project_id = p.id 
-- JOIN profiles pr ON c.responder_id = pr.user_id;
