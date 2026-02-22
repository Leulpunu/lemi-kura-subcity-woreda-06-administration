const mongoose = require('mongoose');
const Office = require('./models/Office');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const officesData = [
    {
        id: 'work-skills',
        name_am: 'ስራና ክህሎት ጽ/ቤት',
        name_en: 'Work and Skills Office',
        icon: 'fa-briefcase',
        color: '#3498db',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'ስራ ፈላጊዎችን ምዝገባ',
                title_en: 'Job Seeker Registration',
                kpis: [
                    { id: 'kpi-1-1', name_am: 'የተመዘገቡ ሰዎች', name_en: 'Registered Individuals', unit: 'ሰዎች', target: 5000 },
                    { id: 'kpi-1-2', name_am: 'የስራ ዕድል የተፈጠረላቸው', name_en: 'People Placed in Jobs', unit: 'ሰዎች', target: 2000 }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ጸጋ ልየታ',
                title_en: 'Disability Services',
                kpis: [
                    { id: 'kpi-2-1', name_am: 'የተሰጡ አገልግሎቶች', name_en: 'Services Provided', unit: 'አገልግሎቶቶች', target: 1000 }
                ]
            },
            {
                id: 'task-3',
                number_am: 'ተግባር 3',
                number_en: 'Task 3',
                title_am: 'ስራ ፈላጊዎች በዕድገት ተኮር የተደራጁ ኢንተርፕራይዝ',
                title_en: 'Job Seekers Organized in Growth Corridors Enterprises',
                kpis: [
                    { id: 'kpi-3-1', name_am: 'የተደራጁ ሰዎች', name_en: 'Organized Individuals', unit: 'ሰዎች', target: 1500 },
                    { id: 'kpi-3-2', name_am: 'የተሰሩ ኢንተርፕራይዞች', name_en: 'Enterprises Created', unit: 'ኢንተርፕራይዞች', target: 50 }
                ]
            },
            {
                id: 'task-4',
                number_am: 'ተግባር 4',
                number_en: 'Task 4',
                title_am: 'ወጣቶችና ሴቶች የቴክኒክ ክህሎት ስልጠና መስጠት',
                title_en: 'Providing Technical Skills Training to Youth and Women',
                kpis: [
                    { id: 'kpi-4-1', name_am: 'የተለማመዱ ሰዎች', name_en: 'Trained Individuals', unit: 'ሰዎች', target: 3000 },
                    { id: 'kpi-4-2', name_am: 'የተሰሩ ስልጠና ፕሮግራሞች', name_en: 'Training Programs Created', unit: 'ፕሮግራሞች', target: 20 }
                ]
            },
            {
                id: 'task-5',
                number_am: 'ተግባር 5',
                number_en: 'Task 5',
                title_am: 'ለወጣቶችና ሴቶች የNaNumber_en: \'Task 1\'',
                title_am: 'የሰብዓዊነት ድጋፍ ተግባሮቻችንን አጠናክረን ማስቀጠል',
                title_en: 'Continuing and Strengthening Our Humanitarian Support Activities',
                kpis: [
                    { id: 'kpi-cg-1-1', name_am: 'ማዕድ ማጋራት', name_en: 'Food Distribution', unit: 'ተጠቃሚዎች', target: 5000 }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'በወረዳው የተለየ ሞዴል ብሎክ',
                title_en: 'Unique Model Block in the District',
                kpis: [
                    { id: 'kpi-cg-2', name_am: 'የተለየ ሞዴል ብሎኮች', name_en: 'Unique Model Blocks', unit: 'ብሎኮች', target: 10 }
                ]
            },
            {
                id: 'task-3',
                number_am: 'ተግባር 3',
                number_en: 'Task 3',
                title_am: 'የቱሪስት መዳረሻ ቦታን መለየት እና ስታንዳርድ ማስጠበቅ',
                title_en: 'Identifying Tourist Destination Sites and Maintaining Standards',
                kpis: [
                    { id: 'kpi-cg-3', name_am: 'የተለየ ቱሪስት ቦታዎች', name_en: 'Identified Tourist Sites', unit: 'ቦታዎች', target: 15 }
                ]
            }
        ]
    },
    {
        id: 'civil-registration',
        name_am: 'ሲቪል ምዝገባ ጽ/ቤት',
        name_en: 'Civil Registration Office',
        icon: 'fa-id-card',
        color: '#e74c3c',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'ፋይዳ መታወቂያ ምዝገባ ማጠናቀቅ',
                title_en: 'Strengthening Vital Statistics Registration',
                kpis: [
                    { id: 'kpi-cr-1', name_am: 'የተመዘገቡ ፋይዳ መታወቂያዎች', name_en: 'Registered Vital Statistics', unit: 'መዝገባዎች', target: 10000 }
                ]
            }
        ]
    },
    {
        id: 'public-service-hr-development',
        name_am: 'የፐብሊክ ሰርቪስና የሰው ሀብት ልማት ጽ/ቤት',
        name_en: 'Public Service and Human Resource Development Office',
        icon: 'fa-graduation-cap',
        color: '#9b59b6',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'የ 5ሚሊዮን ኮደርስ የጨረሱ ባለሙያዎች',
                title_en: 'Professionals Who Completed 5 Million Codes',
                kpis: [
                    { id: 'kpi-pshrd-1-1', name_am: 'የጨረሱ ባለሙያዎች', name_en: 'Completed Professionals', unit: 'ባለሙያዎች', target: 5000 }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ፍቃድ የተሰጣቸው ባለሙያዎች',
                title_en: 'Permitted Professionals',
                kpis: [
                    { id: 'kpi-pshrd-2-1', name_am: 'የአመት ፍቃድ', name_en: 'Annual Permission', unit: 'ፍቃዶች', target: 1000 },
                    { id: 'kpi-pshrd-2-2', name_am: 'የወሊድ ፍቃድ', name_en: 'Maternity Permission', unit: 'ፍቃዶች', target: 500 },
                    { id: 'kpi-pshrd-2-3', name_am: 'የእክል ፍቃድ', name_en: 'Study Permission', unit: 'ፍቃዶች', target: 300 },
                    { id: 'kpi-pshrd-2-4', name_am: 'የህመም ፍቃድ', name_en: 'Sick Permission', unit: 'ፍቃዶች', target: 200 },
                    { id: 'kpi-pshrd-2-5', name_am: 'የተለየ ፍቃድ', name_en: 'Special Permission', unit: 'ፍቃዶች', target: 100 }
                ]
            }
        ]
    }
];

const users = [
    {
        id: 1,
        name: 'ተስፋዬ መኮንን',
        username: 'tesfaye',
        password: 'password123',
        role: 'admin',
        office: 'executive',
        position_am: 'አፈፃፀም ሃላፊ',
        position_en: 'Executive Manager',
        accessibleOffices: ['work-skills', 'urban-agriculture', 'trade', 'peace-security', 'finance', 'community-governance', 'civil-registration', 'public-service-hr-development']
    },
    {
        id: 2,
        name: 'ሚካኤል ደስታ',
        username: 'mikael',
        password: 'password123',
        role: 'user',
        office: 'work-skills',
        position_am: 'ባለሙያ',
        position_en: 'Expert',
        accessibleOffices: ['work-skills']
    }
    // Add more users...
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian-kpi-system');

    // Seed offices
    await Office.deleteMany();
    await Office.insertMany(officesData);

    // Seed users with hashed passwords
    await User.deleteMany();
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({ ...user, password: hashedPassword });
      await newUser.save();
    }

    console.log('Database seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
