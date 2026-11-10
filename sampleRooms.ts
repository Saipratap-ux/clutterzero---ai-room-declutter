import { SampleRoom } from './declutter';

export const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: 'sample-office',
    title: 'Workstation & Cable Sprawl',
    roomType: 'Home Office',
    recommendedStrategy: 'quick_blitz',
    description: 'Paper stacks, loose coffee mugs, sticky notes, and a dense tangle of monitor cables.',
    imageUrl: new URL('./sample_cluttered_home_office_1794334087398.jpg', import.meta.url).href,
    sampleNotes: 'Need my desk clear so I can focus on deep work without daily visual anxiety.',
  },
  {
    id: 'sample-closet',
    title: 'Overflowing Wardrobe Closet',
    roomType: 'Bedroom Closet',
    recommendedStrategy: 'konmari',
    description: 'Clothes slipping off hangers, shoe boxes piled high on the floor, and folded sweater overflow.',
    imageUrl: new URL('./sample_cluttered_wardrobe_closet_1794334088906.jpg', import.meta.url).href,
    sampleNotes: 'Getting dressed in the morning takes 20 minutes because I cannot find anything.',
  },
  {
    id: 'sample-kitchen',
    title: 'Prep Countertop & Mail Drop',
    roomType: 'Kitchen & Counters',
    recommendedStrategy: 'minimalist',
    description: 'Unopened mail, scattered spice jars, utensils, and cutting board occupying prep territory.',
    imageUrl: new URL('./sample_messy_kitchen_counter_1794334089903.jpg', import.meta.url).href,
    sampleNotes: 'Our kitchen island has become an unmanageable dumping ground for keys, envelopes, and cooking clutter.',
  },
  {
    id: 'sample-living',
    title: 'Family Living Room & Play Zone',
    roomType: 'Living Room',
    recommendedStrategy: 'family_functional',
    description: 'Toy train track, building blocks, stuffed animals on rug, blankets strewn across the sofa.',
    imageUrl: new URL('./sample_cluttered_living_room_1794334088990.jpg', import.meta.url).href,
    sampleNotes: 'Need a realistic 5-minute nightly system so toys do not take over the whole evening relaxation zone.',
  },
];
