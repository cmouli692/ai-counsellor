/**
 * Universities Seed Script
 * Inserts 20 dummy universities across USA, Canada, UK, and Germany
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'assignment_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

const universities = [
  // USA - Ivy League & Top Tier
  {
    name: 'Harvard University',
    country: 'USA',
    program: 'Computer Science',
    yearly_cost: 8500000,
    tags: ['Ivy League', 'Research', 'CS', 'AI'],
    acceptance_rate: 3.2,
    avg_gpa: 3.9,
    avg_exam_score: 1530,
    website: 'https://harvard.edu',
    description: 'Prestigious Ivy League institution with world-class CS program'
  },
  {
    name: 'Stanford University',
    country: 'USA',
    program: 'Engineering',
    yearly_cost: 7800000,
    tags: ['Top Tier', 'Silicon Valley', 'Engineering', 'Innovation'],
    acceptance_rate: 3.7,
    avg_gpa: 3.95,
    avg_exam_score: 1520,
    website: 'https://stanford.edu',
    description: 'Leading engineering school in the heart of Silicon Valley'
  },
  {
    name: 'MIT',
    country: 'USA',
    program: 'Computer Science',
    yearly_cost: 8000000,
    tags: ['Ivy League', 'Engineering', 'AI/ML', 'Research'],
    acceptance_rate: 2.7,
    avg_gpa: 3.96,
    avg_exam_score: 1540,
    website: 'https://mit.edu',
    description: 'Premier engineering and technology institute'
  },
  {
    name: 'UC Berkeley',
    country: 'USA',
    program: 'Engineering',
    yearly_cost: 4200000,
    tags: ['Public Ivy', 'STEM', 'Research'],
    acceptance_rate: 8.5,
    avg_gpa: 3.9,
    avg_exam_score: 1485,
    website: 'https://berkeley.edu',
    description: 'Top public university with excellent engineering program'
  },
  {
    name: 'Carnegie Mellon University',
    country: 'USA',
    program: 'Computer Science',
    yearly_cost: 7500000,
    tags: ['Top CS School', 'Pittsburgh', 'AI', 'Tech'],
    acceptance_rate: 6.5,
    avg_gpa: 3.92,
    avg_exam_score: 1510,
    website: 'https://cmu.edu',
    description: 'World-renowned computer science and engineering school'
  },
  {
    name: 'Columbia University',
    country: 'USA',
    program: 'Business & Tech',
    yearly_cost: 8200000,
    tags: ['Ivy League', 'NYC', 'Finance', 'Tech'],
    acceptance_rate: 3.9,
    avg_gpa: 3.94,
    avg_exam_score: 1525,
    website: 'https://columbia.edu',
    description: 'Ivy League school in Manhattan with strong tech programs'
  },
  {
    name: 'University of Chicago',
    country: 'USA',
    program: 'Mathematics',
    yearly_cost: 7900000,
    tags: ['Research', 'STEM', 'Economics'],
    acceptance_rate: 4.6,
    avg_gpa: 3.93,
    avg_exam_score: 1530,
    website: 'https://uchicago.edu',
    description: 'Leading research university with strong quantitative programs'
  },
  {
    name: 'University of Michigan',
    country: 'USA',
    program: 'Engineering',
    yearly_cost: 3800000,
    tags: ['Public School', 'Engineering', 'Michigan'],
    acceptance_rate: 17.0,
    avg_gpa: 3.88,
    avg_exam_score: 1480,
    website: 'https://umich.edu',
    description: 'Top public university with strong engineering college'
  },

  // Canada
  {
    name: 'University of Toronto',
    country: 'Canada',
    program: 'Computer Science',
    yearly_cost: 2500000,
    tags: ['Top Canadian', 'CS', 'Research', 'Toronto'],
    acceptance_rate: 6.2,
    avg_gpa: 3.9,
    avg_exam_score: 1500,
    website: 'https://utoronto.ca',
    description: 'Canada\'s top university with excellent CS program'
  },
  {
    name: 'UBC (University of British Columbia)',
    country: 'Canada',
    program: 'Engineering',
    yearly_cost: 2300000,
    tags: ['West Coast', 'Engineering', 'Vancouver'],
    acceptance_rate: 12.5,
    avg_gpa: 3.88,
    avg_exam_score: 1490,
    website: 'https://ubc.ca',
    description: 'Leading West Coast university with strong engineering'
  },
  {
    name: 'McGill University',
    country: 'Canada',
    program: 'Medicine & Sciences',
    yearly_cost: 2400000,
    tags: ['Montreal', 'Research', 'Medicine'],
    acceptance_rate: 9.8,
    avg_gpa: 3.89,
    avg_exam_score: 1495,
    website: 'https://mcgill.ca',
    description: 'Prestigious Montreal-based research university'
  },

  // UK
  {
    name: 'University of Oxford',
    country: 'UK',
    program: 'Computer Science',
    yearly_cost: 3500000,
    tags: ['Oxbridge', 'Historic', 'Research', 'CS'],
    acceptance_rate: 4.0,
    avg_gpa: 3.95,
    avg_exam_score: 1520,
    website: 'https://oxford.ac.uk',
    description: 'Oldest university with world-leading computer science'
  },
  {
    name: 'University of Cambridge',
    country: 'UK',
    program: 'Mathematics',
    yearly_cost: 3400000,
    tags: ['Oxbridge', 'Historic', 'STEM'],
    acceptance_rate: 3.3,
    avg_gpa: 3.96,
    avg_exam_score: 1525,
    website: 'https://cam.ac.uk',
    description: 'Historic university with exceptional mathematics program'
  },
  {
    name: 'Imperial College London',
    country: 'UK',
    program: 'Engineering',
    yearly_cost: 3600000,
    tags: ['STEM', 'London', 'Engineering', 'Research'],
    acceptance_rate: 8.0,
    avg_gpa: 3.92,
    avg_exam_score: 1510,
    website: 'https://imperial.ac.uk',
    description: 'Leading science and engineering university in London'
  },
  {
    name: 'London School of Economics',
    country: 'UK',
    program: 'Economics & Data Science',
    yearly_cost: 3300000,
    tags: ['London', 'Economics', 'Finance', 'Data'],
    acceptance_rate: 10.5,
    avg_gpa: 3.88,
    avg_exam_score: 1505,
    website: 'https://lse.ac.uk',
    description: 'World-renowned economics and social sciences university'
  },
  {
    name: 'University of Edinburgh',
    country: 'UK',
    program: 'Engineering',
    yearly_cost: 3200000,
    tags: ['Scotland', 'Engineering', 'Research'],
    acceptance_rate: 15.0,
    avg_gpa: 3.85,
    avg_exam_score: 1495,
    website: 'https://ed.ac.uk',
    description: 'Scotland\'s top university with strong engineering tradition'
  },

  // Germany
  {
    name: 'Technical University of Munich (TUM)',
    country: 'Germany',
    program: 'Engineering',
    yearly_cost: 1500000,
    tags: ['Engineering', 'STEM', 'Munich', 'Germany'],
    acceptance_rate: 17.0,
    avg_gpa: 3.85,
    avg_exam_score: 1490,
    website: 'https://tum.de',
    description: 'Top German technical university with excellent engineering'
  },
  {
    name: 'Heidelberg University',
    country: 'Germany',
    program: 'Physics & Mathematics',
    yearly_cost: 1400000,
    tags: ['Historic', 'Research', 'Physics', 'Germany'],
    acceptance_rate: 20.0,
    avg_gpa: 3.82,
    avg_exam_score: 1485,
    website: 'https://uni-heidelberg.de',
    description: 'Germany\'s oldest university with strong physics tradition'
  },
  {
    name: 'Humboldt University of Berlin',
    country: 'Germany',
    program: 'Computer Science',
    yearly_cost: 1300000,
    tags: ['Berlin', 'CS', 'Research', 'Germany'],
    acceptance_rate: 22.0,
    avg_gpa: 3.80,
    avg_exam_score: 1480,
    website: 'https://hu-berlin.de',
    description: 'Historic Berlin university with strong CS program'
  }
];

async function seedUniversities() {
  try {
    await client.connect();
    console.log('Connected to database...');

    // Check if universities already exist
    const checkResult = await client.query('SELECT COUNT(*) FROM universities');
    if (checkResult.rows[0].count > 0) {
      console.log('Universities already seeded. Skipping...');
      await client.end();
      return;
    }

    // Insert universities
    const insertQuery = `
      INSERT INTO universities 
      (name, country, program, yearly_cost, tags, acceptance_rate, avg_gpa, avg_exam_score, website, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    for (const uni of universities) {
      await client.query(insertQuery, [
        uni.name,
        uni.country,
        uni.program,
        uni.yearly_cost,
        uni.tags,
        uni.acceptance_rate,
        uni.avg_gpa,
        uni.avg_exam_score,
        uni.website,
        uni.description
      ]);
      console.log(`✓ Seeded ${uni.name}`);
    }

    console.log(`\n✅ Successfully seeded ${universities.length} universities!`);
    await client.end();
  } catch (error) {
    console.error('Error seeding universities:', error);
    await client.end();
    process.exit(1);
  }
}

// Run seed script
seedUniversities();
