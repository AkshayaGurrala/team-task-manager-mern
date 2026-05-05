const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Team = require('./models/Team');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Team.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin',
    });

    // Create member user
    const member = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: '123456',
      role: 'member',
    });

    // Create another member
    const member2 = await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      password: '123456',
      role: 'member',
    });

    console.log('👥 Users created');

    // Create Teams
    const team1 = await Team.create({
      name: 'Frontend Team',
      members: [member._id, member2._id],
      createdBy: admin._id
    });

    const team2 = await Team.create({
      name: 'Backend Team',
      members: [admin._id, member2._id],
      createdBy: admin._id
    });

    console.log('👥 Teams created');

    // Create projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      members: [admin._id],
      teams: [team1._id],
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile application',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      members: [admin._id, member._id],
      teams: [team2._id],
      createdBy: admin._id,
    });

    console.log('📁 Projects created');

    // Create tasks
    await Task.create([
      {
        title: 'Design Homepage Mockup',
        description: 'Create wireframes and mockups for the new homepage',
        status: 'Completed',
        priority: 'High',
        team: team1._id,
        projectId: project1._id,
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Implement Authentication',
        description: 'Set up JWT-based authentication system',
        status: 'In Progress',
        priority: 'High',
        assignedTo: member._id,
        projectId: project1._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Setup Database Schema',
        description: 'Design and implement MongoDB collections',
        status: 'Pending',
        priority: 'Medium',
        team: team2._id,
        projectId: project2._id,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Create API Documentation',
        description: 'Write comprehensive API documentation',
        status: 'Pending',
        priority: 'Low',
        assignedTo: member._id,
        projectId: project1._id,
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // overdue
        createdBy: admin._id,
      },
      {
        title: 'Build Dashboard UI',
        description: 'Implement the analytics dashboard',
        status: 'In Progress',
        priority: 'Medium',
        assignedTo: admin._id,
        projectId: project2._id,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
    ]);

    console.log('✅ Tasks created');
    console.log('\n🎉 Seed data created successfully!');
    console.log('📧 Admin: admin@test.com / 123456');
    console.log('📧 Member: member@test.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
