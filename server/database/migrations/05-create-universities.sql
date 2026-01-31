-- Create Universities Table
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  program VARCHAR(255) NOT NULL,
  yearly_cost INTEGER NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  acceptance_rate DECIMAL(5,2) NOT NULL,
  avg_gpa DECIMAL(3,2) NOT NULL,
  avg_exam_score INTEGER NOT NULL,
  website VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for commonly filtered fields
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_yearly_cost ON universities(yearly_cost);
CREATE INDEX idx_universities_program ON universities(program);
CREATE INDEX idx_universities_acceptance_rate ON universities(acceptance_rate);
