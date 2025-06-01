-- Enable Row Level Security on the tables
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access to festivals table
CREATE POLICY "Allow anonymous read access to festivals"
  ON festivals
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users full access to festivals"
  ON festivals
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for profile access
CREATE POLICY "Allow users to read all profiles"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow users to update their own profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for volunteer access
CREATE POLICY "Allow anonymous read access to volunteers"
  ON volunteers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to read all volunteers"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to manage their own volunteer records"
  ON volunteers
  FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id); 