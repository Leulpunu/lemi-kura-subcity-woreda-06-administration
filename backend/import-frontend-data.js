const { sql } = require('./db');

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
                    { id: 'kpi-1-1', name_am: 'የተመዘገቡ ሰዎች', name_en: 'Registered Individuals' },
                    { id: 'kpi-1-2', name_am: 'የስራ ዕድል የተፈጠረላቸው', name_en: 'People Placed in Jobs' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ጸጋ ልየታ',
                title_en: 'Disability Services',
                kpis: [
                    { id: 'kpi-2-1', name_am: 'የተሰጡ አገልግሎቶች', name_en: 'Services Provided' }
                ]
            },
            {
                id: 'task-3',
                number_am: 'ተግባር 3',
                number_en: 'Task 3',
                title_am: 'ስራ ፈላጊዎች በዕድገት ተኮር የተደራጁ ኢንተርፕራይዝ',
                title_en: 'Job Seekers Organized in Growth Corridors Enterprises',
                kpis: [
                    { id: 'kpi-3-1', name_am: 'የተደራጁ ሰዎች', name_en: 'Organized Individuals' },
                    { id: 'kpi-3-2', name_am: 'የተሰሩ ኢንተርፕራይዞች', name_en: 'Enterprises Created' }
                ]
            },
            {
                id: 'task-4',
                number_am: 'ተግባር 4',
                number_en: 'Task 4',
                title_am: 'ወጣቶችና ሴቶች የቴክኒክ ክህሎት ስልጠና መስጠት',
                title_en: 'Providing Technical Skills Training to Youth and Women',
                kpis: [
                    { id: 'kpi-4-1', name_am: 'የተለማመዱ ሰዎች', name_en: 'Trained Individuals' },
                    { id: 'kpi-4-2', name_am: 'የተሰሩ ስልጠና ፕሮግራሞች', name_en: 'Training Programs Created' }
                ]
            },
            {
                id: 'task-5',
                number_am: 'ተግባር 5',
                number_en: 'Task 5',
                title_am: 'ለወጣቶችና ሴቶች የስራ ዕድል መፍጠር በተመለከተ',
                title_en: 'Creating Job Opportunities for Youth and Women',
                kpis: [
                    { id: 'kpi-5-1', name_am: 'የተፈጠሩ ስራ እድሎች', name_en: 'Job Opportunities Created' },
                    { id: 'kpi-5-2', name_am: 'የተለማመዱ ሰዎች ተቀጠሩ', name_en: 'Trained People Employed' }
                ]
            }
        ]
    },
    {
        id: 'urban-agriculture',
        name_am: 'ከተማ ግብርና ጽ/ቤት',
        name_en: 'Urban Agriculture Office',
        icon: 'fa-seedling',
        color: '#27ae60',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'የከተማ ግብርና ምርት አቅርቦት ማሳደግ',
                title_en: 'Increasing Urban Agriculture Production Supply',
                kpis: [
                    { id: 'kpi-ua-1-1', name_am: 'የእንቁላል ምርት መጨመር', name_en: 'Egg Production Increase' },
                    { id: 'kpi-ua-1-2', name_am: 'የሰብል ምርት መጨመር', name_en: 'Crop Production Increase' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'የሌማት ትሩፋት ምርቶችን በእጥፍ ማሳደግ',
                title_en: 'Increasing Lemon and Tangerine Products in Surplus',
                kpis: [
                    { id: 'kpi-ua-2-1', name_am: 'የጓሮ አትክልት ምርት', name_en: 'Orange Production' },
                    { id: 'kpi-ua-2-2', name_am: 'የዶሮ ምርት', name_en: 'Tangerine Production' }
                ]
            }
        ]
    },
    {
        id: 'trade',
        name_am: 'ንግድ ጽ/ቤት',
        name_en: 'Trade Office',
        icon: 'fa-shopping-cart',
        color: '#e67e22',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'በንግድ የምርት አቅርቦቱን በማሳደግ የዋጋ ንረትን ማረጋጋት',
                title_en: 'Stabilizing Price Fluctuations by Increasing Product Supply in Trade',
                kpis: [
                    { id: 'kpi-trade-1-1', name_am: 'ሰብል ምርት ማቅረብ', name_en: 'Crop Supply' },
                    { id: 'kpi-trade-1-2', name_am: 'አትክልትና ፍራፍሪ ምርት', name_en: 'Fruits and Vegetables' },
                    { id: 'kpi-trade-1-3', name_am: 'የእንስሳት ተዋጽኦ ምርት', name_en: 'Animal Products' },
                    { id: 'kpi-trade-1-4', name_am: 'እንቁላል ማቅረብ', name_en: 'Egg Supply' },
                    { id: 'kpi-trade-1-5', name_am: 'ስኳር ማቅረብ', name_en: 'Sugar Supply' },
                    { id: 'kpi-trade-1-6', name_am: 'ሸገር ዳቦ ማቅረብ', name_en: 'Bread Supply' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ህገወጥ ንግድ ከመከላከል አንጻር የተሰሩ ስራዎች',
                title_en: 'Works Done in Parallel with Preventing Illegal Trade',
                kpis: [
                    { id: 'kpi-trade-2-1', name_am: 'የንግድ ድርጅቶች ቴክኖሎጂ በመጠቀም የንግድ ቁጥጥር', name_en: 'Trade Control Using Technology' },
                    { id: 'kpi-trade-2-2', name_am: 'መጋዘን ፍተሻ በማድረግ የምርት ክምችትና ሰው ሰራሽ እጥረት መቀነስ', name_en: 'Reducing Product Shortage and Labor Shortage Through Market Research' }
                ]
            }
        ]
    },
    {
        id: 'peace-security',
        name_am: 'ሰላምና ጸጥታ ጽ/ቤት',
        name_en: 'Peace and Security Office',
        icon: 'fa-shield-alt',
        color: '#8e44ad',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'የጥፋት ሀይል እንቅስቃሴ መከላከል እና መቆጣጠር',
                title_en: 'Preventing and Controlling Destructive Force Activities',
                kpis: [
                    { id: 'kpi-ps-1-1', name_am: 'በጽንፈኝነት የተከላከሉ እንቅስቃሴዎች', name_en: 'Activities Prevented Through Intelligence' },
                    { id: 'kpi-ps-1-2', name_am: 'በሌብነት የተከላከሉ እንቅስቃሴዎች', name_en: 'Activities Prevented Through Community' },
                    { id: 'kpi-ps-1-3', name_am: 'በወንጀል የተከላከሉ እንቅስቃሴዎች', name_en: 'Activities Prevented Through Crime' },
                    { id: 'kpi-ps-1-4', name_am: 'በፍታብሄር የተከላከሉ እንቅስቃሴዎች', name_en: 'Activities Prevented Through Corruption' },
                    { id: 'kpi-ps-1-5', name_am: 'የሰላም ሰራዊት ስምሪት', name_en: 'Peace Force Deployment' },
                    { id: 'kpi-ps-1-6', name_am: 'እርምጃ የተወሰደ ህገወጥ ተግባር', name_en: 'Actions Taken Against Illegal Activities' }
                ]
            }
        ]
    },
    {
        id: 'finance',
        name_am: 'ፋይናንስ ጽ/ቤት',
        name_en: 'Finance Office',
        icon: 'fa-money-bill-wave',
        color: '#f39c12',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'መደበኛ አመታዊ ገቢን ማሳደግ',
                title_en: 'Increasing Regular Annual Income',
                kpis: [
                    { id: 'kpi-fin-1', name_am: 'መደበኛ አመታዊ ገቢ', name_en: 'Regular Annual Income' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ማዘጋጃቤታዊ አመታዊ ገቢያችንን ማሳደግ',
                title_en: 'Increasing Our Investment Annual Income',
                kpis: [
                    { id: 'kpi-fin-2', name_am: 'ማዘጋጃቤታዊ አመታዊ ገቢ', name_en: 'Investment Annual Income' }
                ]
            }
        ]
    },
    {
        id: 'community-governance',
        name_am: 'ህብረተሰብ ተሳትፎና በጎፍቃድ ማስተባበሪያ ጽ/ቤት',
        name_en: 'Community Participation and Good Governance Office',
        icon: 'fa-users',
        color: '#16a085',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'የሰብዓዊነት ድጋፍ ተግባሮቻችንን አጠናክረን ማስቀጠል',
                title_en: 'Continuing and Strengthening Our Humanitarian Support Activities',
                kpis: [
                    { id: 'kpi-cg-1-1', name_am: 'ማዕድ ማጋራት', name_en: 'Food Distribution' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'በወረዳው የተለየ ሞዴል ብሎክ',
                title_en: 'Unique Model Block in the District',
                kpis: [
                    { id: 'kpi-cg-2', name_am: 'የተለየ ሞዴል ብሎኮች', name_en: 'Unique Model Blocks' }
                ]
            },
            {
                id: 'task-3',
                number_am: 'ተግባር 3',
                number_en: 'Task 3',
                title_am: 'የቱሪስት መዳረሻ ቦታን መለየት እና ስታንዳርድ ማስጠበቅ',
                title_en: 'Identifying Tourist Destination Sites and Maintaining Standards',
                kpis: [
                    { id: 'kpi-cg-3', name_am: 'የተለየ ቱሪስት ቦታዎች', name_en: 'Identified Tourist Sites' }
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
                title_am: 'ፋይዳ መወቂታያ ምዝገባ ማጠናቀቅ',
                title_en: 'Strengthening Vital Statistics Registration',
                kpis: [
                    { id: 'kpi-cr-1', name_am: 'የተመዘገቡ ፋይዳ መታወቂያዎች', name_en: 'Registered Vital Statistics' }
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
                    { id: 'kpi-pshrd-1-1', name_am: 'የጨረሱ ባለሙያዎች', name_en: 'Completed Professionals' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'ፍቃድ የተሰጣቸው ባለሙያዎች',
                title_en: 'Permitted Professionals',
                kpis: [
                    { id: 'kpi-pshrd-2-1', name_am: 'የአመት ፍቃድ', name_en: 'Annual Permission' },
                    { id: 'kpi-pshrd-2-2', name_am: 'የወሊድ ፍቃድ', name_en: 'Maternity Permission' },
                    { id: 'kpi-pshrd-2-3', name_am: 'የእክል ፍቃድ', name_en: 'Study Permission' },
                    { id: 'kpi-pshrd-2-4', name_am: 'የህመም ፍቃድ', name_en: 'Sick Permission' },
                    { id: 'kpi-pshrd-2-5', name_am: 'የተለየ ፍቃድ', name_en: 'Special Permission' }
                ]
            }
        ]
    },
    {
        id: 'party-works',
        name_am: 'የፓርቲ ስራዎች ለጠቅላላ አመራሩ',
        name_en: 'Party Works for General Administration',
        icon: 'fa-flag',
        color: '#c0392b',
        tasks: [
            {
                id: 'task-1',
                number_am: 'ተግባር 1',
                number_en: 'Task 1',
                title_am: 'የቤተሰብ ውይይት',
                title_en: 'Family Discussion',
                kpis: [
                    { id: 'kpi-pw-1-1', name_am: 'የተካሄዱ ውይይቶች', name_en: 'Discussions Held' },
                    { id: 'kpi-pw-1-2', name_am: 'ተሳታፊዎች', name_en: 'Participants' }
                ]
            },
            {
                id: 'task-2',
                number_am: 'ተግባር 2',
                number_en: 'Task 2',
                title_am: 'የአባላት ክፍያ',
                title_en: 'Member Payment',
                kpis: [
                    { id: 'kpi-pw-2-1', name_am: 'የተከፈሉ አባላት', name_en: 'Paid Members' },
                    { id: 'kpi-pw-2-2', name_am: 'የተሰበሰበ ገንዘብ', name_en: 'Amount Collected' }
                ]
            },
            {
                id: 'task-3',
                number_am: 'ተግባር 3',
                number_en: 'Task 3',
                title_am: 'የአባላት ምልመላ',
                title_en: 'Member Selection',
                kpis: [
                    { id: 'kpi-pw-3-1', name_am: 'የተመረጡ አባላት', name_en: 'Selected Members' },
                    { id: 'kpi-pw-3-2', name_am: 'የተሰዉት ኮሚቶች', name_en: 'Committees Formed' }
                ]
            },
            {
                id: 'task-4',
                number_am: 'ተግር 4',
                number_en: 'Task 4',
                title_am: 'ህገደንብ ውይይት',
                title_en: 'Charter Discussion',
                kpis: [
                    { id: 'kpi-pw-4-1', name_am: 'የተካሄዱ ውይይቶች', name_en: 'Charter Discussions Held' },
                    { id: 'kpi-pw-4-2', name_am: 'የተሳተፉ አባላት', name_en: 'Members Participated' }
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
        position_en: 'Executive Manager'
    },
    {
        id: 2,
        name: 'ሚካኤል ደስታ',
        username: 'mikael',
        password: 'password123',
        role: 'user',
        office: 'work-skills',
        position_am: 'ባለሙያ',
        position_en: 'Expert'
    }
];

async function importData() {
  try {
    console.log('Importing frontend data to PostgreSQL...');

    // Import Users
    console.log('\nImporting users...');
    for (const user of users) {
      await sql`
        INSERT INTO users (id, name, username, password, role, office, position_am, position_en)
        VALUES (${user.id}, ${user.name}, ${user.username}, ${user.password}, ${user.role}, ${user.office}, ${user.position_am}, ${user.position_en})
        ON CONFLICT (username) DO UPDATE SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          office = EXCLUDED.office,
          position_am = EXCLUDED.position_am,
          position_en = EXCLUDED.position_en
      `;
    }
    console.log(`✅ Imported ${users.length} users`);

    // Import Offices
    console.log('\nImporting offices...');
    for (const office of officesData) {
      await sql`
        INSERT INTO offices (office_id, name_am, name_en, icon, color, tasks)
        VALUES (${office.id}, ${office.name_am}, ${office.name_en}, ${office.icon}, ${office.color}, ${JSON.stringify(office.tasks)})
        ON CONFLICT (office_id) DO UPDATE SET
          name_am = EXCLUDED.name_am,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon,
          color = EXCLUDED.color,
          tasks = EXCLUDED.tasks
      `;
    }
    console.log(`✅ Imported ${officesData.length} offices`);

    console.log('\n🎉 Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importData();
