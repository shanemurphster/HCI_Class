// Mock data for Homerun prototype
(function(){
  const { storage } = window.Homerun || { storage: { ensure: (k,v)=>v, set:()=>{}, get:()=>null } };

  const seedUser = storage.ensure('currentUser', { id: 'u1', name: 'Ava Chen', sport: 'W Track', role: 'Captain', classYear: "'27", school: 'SEAS' });

  const users = [
    { id: 'u1', name: 'Ava Chen', sport: 'W Track', role: 'Captain', classYear: "'27" },
    { id: 'u2', name: 'Malik Ortiz', sport: 'Baseball', role: 'Athlete', classYear: "'26" },
    { id: 'u3', name: 'Priya Singh', sport: 'Field Hockey', role: 'Athlete', classYear: "'27" },
    { id: 'u4', name: 'Jordan Kim', sport: 'M Soccer', role: 'Athlete', classYear: "'25" },
  ];

  const teams = [
    { id: 't1', name: "Penn Women\'s Track" },
    { id: 't2', name: 'Penn Baseball' },
    { id: 't3', name: 'Penn Field Hockey' },
  ];

  const conversations = storage.ensure('conversations', [
    { id: 'c1', type: 'dm', title: 'Priya Singh', participants: ['u1','u3'], lastRead: { u1: 2, u3: 2 }, messages: [
      { from: 'u3', text: 'You ready for lift later?', at: '2025-10-10T10:14:00Z' },
      { from: 'u1', text: 'Yep! 3–5pm at Pottruck. See you there 💪', at: '2025-10-10T10:16:00Z' }
    ] },
    { id: 'c2', type: 'team', teamId: 't1', title: "Penn Women\'s Track", participants: ['u1','u2','u3','u4'], messages: [
      { from: 'u1', text: 'Travel roster posted. Check Captain\'s Corner for details.', at: '2025-10-09T21:05:00Z' },
      { from: 'u4', text: 'Got it. Bus at 6am?', at: '2025-10-09T21:09:00Z' }
    ] },
    { id: 'c3', type: 'captain', title: "Captain\'s Corner", participants: ['u1'], topics: [
      { id:'cc1', title:'Ivy League Travel Policy Update' },
      { id:'cc2', title:'Spring Showcase Coordination' },
    ], messages: [
      { from: 'u1', text: 'Drafting showcase schedule for next week.', at: '2025-10-08T15:00:00Z' }
    ], joinRequests: [ { id:'jr1', name:'New Athlete 1', sport:'W Track' }, { id:'jr2', name:'New Athlete 2', sport:'W Track' }, { id:'jr3', name:'New Athlete 3', sport:'W Track' } ] },
  ]);

  const events = storage.ensure('events', [
    { id:'e1', title:'Food Drop @ Franklin Field', hostTeam:'t1', when:'2025-10-11T14:00:00Z', where:'Franklin Field', visibility:'Campus', rsvp: { going: 12, interested: 31 }, description:'Snacks and hydration handoff for travel day.', attachments:[{type:'pdf', name:'Travel List.pdf'}] },
    { id:'e2', title:'Game Night @ Pottruck', hostTeam:'t2', when:'2025-10-12T19:30:00Z', where:'Pottruck', visibility:'Campus', rsvp: { going: 7, interested: 20 }, description:'Open gym and board games.', attachments:[{type:'flyer', name:'Flyer.png'}] },
    { id:'e3', title:'PAWLA Outreach', hostTeam:'t3', when:'2025-10-13T10:00:00Z', where:'DRL', visibility:'Team-only', rsvp: { going: 4, interested: 9 }, description:'Volunteers needed for outreach.', attachments:[] },
  ]);

  const travel = storage.ensure('travel', [
    { id:'tr1', teamId:'t1', label:"W Track @ Princeton • Fri–Sun", start:'2025-10-17', end:'2025-10-19', away:true },
    { id:'tr2', teamId:'t2', label:'Baseball @ Columbia • Sat', start:'2025-10-18', end:'2025-10-18', away:false },
  ]);

  const reels = storage.ensure('reels', [
    { id:'r1', title:'4x400 handoff at Penn Relays', tags:['W Track','Penn Relays'], likes: 128, comments:[{by:'Malik', text:"let\'s go!!", at:'2025-10-10T08:00:00Z'}], videoSrc:'assets/video/relay.mp4', poster:'assets/img/relay.jpg' },
    { id:'r2', title:'PR Clean 2x @ Pottruck', tags:['Lift','Pottruck'], likes: 76, comments:[], videoSrc:'assets/video/clean.mp4', poster:'assets/img/clean.jpg' },
    { id:'r3', title:'Walk-off single vs. Yale', tags:['Baseball'], likes: 211, comments:[{by:'Ava', text:'Clutch!', at:'2025-10-09T18:10:00Z'}], videoSrc:'assets/video/walkoff.mp4', poster:'assets/img/walkoff.jpg' },
  ]);

  const matches = storage.ensure('matches', {
    queue: [
      { id:'m1', name:'Leo Park', sport:'M Soccer', school:'SEAS', classYear:"\'26", tags:['Striker','SEAS \u201926'], team:'Penn Men\'s Soccer' },
      { id:'m2', name:'Zoe Alvarez', sport:'W Rowing', school:'Wharton', classYear:"\'27", tags:['Port','Wharton \u201927'], team:'Penn Women\'s Rowing' },
    ],
    matched: []
  });

  const lockerProfile = storage.ensure('lockerProfile', {
    theme: { primary: '#011F5B', secondary: '#990000', accent: '#2AD3B3', fontHead:'Archivo', fontBody:'Inter' },
    photos: [],
    stickers: ['⭐','🔥','🏆'],
    funFacts: ['400m / 800m','SEAS \u201927','Favorite pre-race song: RITMO'],
    schedule: [
      { day:'Mon', what:'Practice', when:'7–9am' },
      { day:'Tue', what:'Lift', when:'3–5pm' },
      { day:'Wed', what:'Practice', when:'7–9am' },
      { day:'Thu', what:'Lift', when:'3–5pm' },
      { day:'Fri', what:'Practice', when:'7–9am' },
      { day:'Sat', what:'Meet', when:'All day' }
    ],
    privacy: { photos:'public', stickers:'teammates', facts:'public', schedule:'teammates' },
    avatar: {
      outfit: { top:null, bottom:null, shoes:null, accessory:null }
    }
  });

  // Backfill avatar for existing profiles without it
  if (!lockerProfile.avatar) {
    lockerProfile.avatar = { outfit: { top:null, bottom:null, shoes:null, accessory:null } };
    storage.set('lockerProfile', lockerProfile);
  }

  const clothingCatalog = storage.ensure('clothingCatalog', {
    tops: [
      { id:'top1', name:'Penn Tee (Blue)', color:'#011F5B', emoji:'👕' },
      { id:'top2', name:'Penn Tee (Red)', color:'#990000', emoji:'👕' },
      { id:'top3', name:'Warmup Jacket', color:'#3F3F46', emoji:'🧥' }
    ],
    bottoms: [
      { id:'bot1', name:'Track Shorts', color:'#0EA5E9', emoji:'🩳' },
      { id:'bot2', name:'Sweats', color:'#6B7280', emoji:'🩳' }
    ],
    shoes: [
      { id:'sh1', name:'Spikes', color:'#2AD3B3', emoji:'👟' },
      { id:'sh2', name:'Trainers', color:'#10B981', emoji:'👟' }
    ],
    accessories: [
      { id:'acc1', name:'Headband', color:'#F59E0B', emoji:'🧢' },
      { id:'acc2', name:'Sunglasses', color:'#111827', emoji:'🕶️' },
      { id:'acc3', name:'Medal', color:'#FBBF24', emoji:'🏅' }
    ]
  });

  // RSVP, likes, comments persisted separately per user
  storage.ensure('rsvpState', {});
  storage.ensure('likesState', {});
  storage.ensure('commentsState', {});

  window.MockData = { users, teams, conversations, events, travel, reels, matches, lockerProfile, clothingCatalog };
})();


