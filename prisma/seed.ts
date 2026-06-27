import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records
  await prisma.comment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Create Users
  const usersData = [
    {
      id: 'user_alex',
      name: 'Alex Mercer',
      email: 'citizen@example.com',
      role: 'citizen',
      points: 145,
      badges: ['Community Hero', 'Top Reporter'],
      ward: 'Ward 5 - Heights',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_marcus',
      name: 'Inspector Marcus Vance',
      email: 'officer@example.com',
      role: 'officer',
      points: 0,
      badges: ['Municipal Officer'],
      ward: 'Citywide',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_vendor_repairs',
      name: 'Rapid Repairs Corp',
      email: 'vendor@example.com',
      role: 'vendor',
      points: 120,
      badges: ['Certified Contractor', 'Road Specialist'],
      ward: 'Citywide',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_vendor_aquaflow',
      name: 'AquaFlow Utilities Ltd',
      email: 'aquaflow@example.com',
      role: 'vendor',
      points: 85,
      badges: ['Certified Contractor', 'Water Specialist'],
      ward: 'Citywide',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_vendor_ecowaste',
      name: 'EcoWaste Operators',
      email: 'ecowaste@example.com',
      role: 'vendor',
      points: 95,
      badges: ['Certified Contractor', 'Garbage Specialist'],
      ward: 'Citywide',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_sarah',
      name: 'Sarah Jenkins',
      email: 'admin@example.com',
      role: 'admin',
      points: 0,
      badges: ['City Director'],
      ward: 'City Hall',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_elena',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      role: 'citizen',
      points: 210,
      badges: ['Community Hero', 'Top Reporter', 'Problem Solver'],
      ward: 'Ward 3 - Mission',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    {
      id: 'user_devon',
      name: 'Devon Lane',
      email: 'devon@example.com',
      role: 'citizen',
      points: 95,
      badges: ['Neighborhood Champion'],
      ward: 'Ward 5 - Heights',
      state: 'California',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      passwordHash: DEFAULT_PASSWORD_HASH,
    }
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }
  console.log(`👤 Seeded ${usersData.length} users.`);

  // 3. Create Issues
  const issuesData = [
    {
      id: 'issue_pothole_1',
      title: 'Severe Pothole on 14th Street Intersection',
      description: 'A deep pothole measuring nearly 2 feet wide has developed right after the pedestrian crossing. It is causing cars to swerve dangerously into the oncoming lane to avoid it, presenting an immediate hazard to both vehicular traffic and cyclists.',
      category: 'Road Damage',
      severity: 'High',
      status: 'In Progress',
      lat: 37.7749,
      lng: -122.4194,
      address: '14th St & Valencia St, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800',
      upvotes: 42,
      verifiedBy: ['user_elena', 'user_devon'],
      aiConfidence: 94,
      verificationScore: 52,
      priority: 'Critical',
      estimatedImpact: 1200,
      assignedOfficerId: 'user_marcus',
      assignedOfficerName: 'Inspector Marcus Vance',
      assignedVendorId: 'user_vendor_repairs',
      assignedVendorName: 'Rapid Repairs Corp',
      allotmentType: 'manual',
      costEstimate: 850,
      resolutionTimeline: '2026-06-28',
      createdBy: 'user_alex',
      creatorName: 'Alex Mercer',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      publicCommentsCount: 3,
      progressUpdates: [
        {
          status: 'Reported',
          note: 'Issue successfully logged in the system. AI models detected Road Damage with 94% confidence.',
          updatedBy: 'System AI',
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Verified',
          note: 'Issue verified by community consensus. Escalated to Road Maintenance division.',
          updatedBy: 'System Guard',
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Assigned',
          note: 'Assigned to Ward 3 maintenance team led by Inspector Marcus Vance.',
          updatedBy: 'Sarah Jenkins (Admin)',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'In Progress',
          note: 'Asphalt patching crew dispatched. Expect temporary lane closure. Completion estimated by June 28.',
          updatedBy: 'Inspector Marcus Vance',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400'
        }
      ] as any
    },
    {
      id: 'issue_leak_1',
      title: 'Major Water Pipe Leakage on Oak Crescent',
      description: 'Fresh water is gushing out of the sidewalk pavement near the fire hydrant. It has been running continuously for 12 hours, flooding the driveway of houses 14 to 18, and eroding the base of the curb.',
      category: 'Water Leakage',
      severity: 'High',
      status: 'Assigned',
      lat: 37.7833,
      lng: -122.4167,
      address: '145 Oak Crescent, San Francisco, CA',
      ward: 'Ward 5 - Heights',
      imageUrl: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800',
      upvotes: 28,
      verifiedBy: ['user_alex'],
      aiConfidence: 89,
      verificationScore: 33,
      priority: 'High',
      estimatedImpact: 600,
      assignedOfficerId: 'user_marcus',
      assignedOfficerName: 'Inspector Marcus Vance',
      assignedVendorId: 'user_vendor_aquaflow',
      assignedVendorName: 'AquaFlow Utilities Ltd',
      allotmentType: 'automatic',
      costEstimate: 1400,
      resolutionTimeline: '2026-06-30',
      createdBy: 'user_devon',
      creatorName: 'Devon Lane',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publicCommentsCount: 1,
      progressUpdates: [
        {
          status: 'Reported',
          note: 'AI classified as high severity Water Leakage. Automatic alert dispatched to Water & Sewage Utility.',
          updatedBy: 'System AI',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Verified',
          note: 'Curb-side assessment confirmed by citizen verify action. Priority set to High.',
          updatedBy: 'System Guard',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Assigned',
          note: 'Assigned to Inspector Marcus Vance for site excavation planning.',
          updatedBy: 'Sarah Jenkins (Admin)',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ] as any
    },
    {
      id: 'issue_garbage_1',
      title: 'Overflowing Waste Bins & Illegal Dumping in Alley',
      description: 'The communal trash bins in the alley behind commercial complex have not been emptied for two scheduled cycles. Piles of plastic bags, loose packaging, and organic waste have spilled across the alley, attracting stray animals and creating strong bad odors.',
      category: 'Garbage Collection',
      severity: 'Medium',
      status: 'Reported',
      lat: 37.7699,
      lng: -122.4468,
      address: 'Caledonia Alley, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800',
      upvotes: 12,
      verifiedBy: [],
      aiConfidence: 96,
      verificationScore: 12,
      priority: 'Medium',
      estimatedImpact: 350,
      assignedVendorId: 'user_vendor_ecowaste',
      assignedVendorName: 'EcoWaste Operators',
      allotmentType: 'automatic',
      createdBy: 'user_elena',
      creatorName: 'Elena Rostova',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      publicCommentsCount: 0,
      progressUpdates: [
        {
          status: 'Reported',
          note: 'AI detected Garbage Accumulation (96% Confidence). Forwarded to Waste Management Division.',
          updatedBy: 'System AI',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ] as any
    },
    {
      id: 'issue_light_1',
      title: 'Broken Streetlight Near Playground Pathway',
      description: 'The street lamp directly opposite the community park kids sandbox has been flickering and is now completely blacked out. This leaves the entire pedestrian pathway in pitch darkness after 8 PM, making residents feel extremely unsafe walking their dogs or coming home.',
      category: 'Broken Streetlight',
      severity: 'Low',
      status: 'Resolved',
      lat: 37.7599,
      lng: -122.4368,
      address: 'Dolores Park Pathway, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800',
      upvotes: 19,
      verifiedBy: ['user_alex', 'user_devon'],
      aiConfidence: 91,
      verificationScore: 29,
      priority: 'Low',
      estimatedImpact: 200,
      assignedOfficerId: 'user_marcus',
      assignedOfficerName: 'Inspector Marcus Vance',
      costEstimate: 220,
      resolutionTimeline: '2026-06-22',
      createdBy: 'user_elena',
      creatorName: 'Elena Rostova',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publicCommentsCount: 2,
      progressUpdates: [
        {
          status: 'Reported',
          note: 'Issue reported. AI flagged as light infrastructure failure.',
          updatedBy: 'System AI',
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Assigned',
          note: 'Assigned to Electrical Maintenance unit.',
          updatedBy: 'Sarah Jenkins (Admin)',
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'In Progress',
          note: 'Bulb and ballast replacement scheduled for next service route.',
          updatedBy: 'Inspector Marcus Vance',
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: 'Resolved',
          note: 'Completed. High-efficiency LED luminaire installed. Light is now fully functional.',
          updatedBy: 'Inspector Marcus Vance',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          photoUrl: 'https://images.unsplash.com/photo-1517420712361-29402d23b7e1?auto=format&fit=crop&w=400'
        }
      ] as any
    }
  ];

  for (const i of issuesData) {
    await prisma.issue.create({ data: i });
  }
  console.log(`📌 Seeded ${issuesData.length} issues.`);

  // 4. Create Comments
  const commentsData = [
    {
      id: 'comment_1',
      issueId: 'issue_pothole_1',
      userId: 'user_elena',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
      content: 'My sedan bottomed out on this yesterday! There is some fluid leaking now. Extremely glad this is finally being patched!',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'comment_2',
      issueId: 'issue_pothole_1',
      userId: 'user_devon',
      userName: 'Devon Lane',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
      content: 'Can confirm! I rode my bicycle past here earlier and nearly fell over. The pothole is virtually invisible at night due to shadows.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      evidencePhoto: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400'
    },
    {
      id: 'comment_3',
      issueId: 'issue_pothole_1',
      userId: 'user_marcus',
      userName: 'Inspector Marcus Vance',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
      content: 'Team is active on site. We are sealing the outer edges first to prevent further crumbling, then hot asphalt pour will occur in 2 hours.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      id: 'comment_4',
      issueId: 'issue_leak_1',
      userId: 'user_alex',
      userName: 'Alex Mercer',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      content: 'Water pressure in my building has dropped significantly since this started. Hoping they shut off the main valve to repair it soon.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'comment_5',
      issueId: 'issue_light_1',
      userId: 'user_alex',
      userName: 'Alex Mercer',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      content: 'Thank you Marcus for sorting this out! Walks at night are so much better now.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const c of commentsData) {
    await prisma.comment.create({ data: c });
  }
  console.log(`💬 Seeded ${commentsData.length} comments.`);

  // 5. Create Notifications
  const notificationsData = [
    {
      id: 'notif_1',
      userId: 'user_alex',
      title: 'Pothole Update',
      message: 'The pothole you reported on 14th Street is now "In Progress". Work has begun!',
      type: 'success',
      isRead: false,
      issueId: 'issue_pothole_1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'notif_2',
      userId: 'user_alex',
      title: 'New Verification',
      message: 'Elena Rostova verified your reported issue on 14th Street.',
      type: 'info',
      isRead: false,
      issueId: 'issue_pothole_1',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'notif_3',
      userId: 'user_devon',
      title: 'Issue Assigned',
      message: 'The water leakage on Oak Crescent has been assigned to Public Works team.',
      type: 'info',
      isRead: false,
      issueId: 'issue_leak_1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }
  console.log(`🔔 Seeded ${notificationsData.length} notifications.`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
