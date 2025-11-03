import type { Document, Author } from './types';

export const authors: Author[] = [
  { id: '1', name: 'Hritik Roshan', avatarUrl: 'https://i.pravatar.cc/40?u=1' },
  { id: '2', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/40?u=2' },
  { id: '3', name: 'Sam Wilson', avatarUrl: 'https://i.pravatar.cc/40?u=3' },
  { id: '4', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/40?u=4' },
];

export const documents: Document[] = [
  {
    id: '2cb406dd-8cdb-4a71-981b-c31c3487207d',
    title: 'New Testing Document',
    snippet: 'I am writing content here to place something',
    status: 'READY TO PUBLISH',
    visibility: 'PRIVATE',
    lastUpdated: '2025-10-28',
    authorId: '1',
    //- Fix: Added missing properties to satisfy Document type.
    ownerId: '1',
    accessList: ['1'],
  },
  {
    id: 'b419433d-5c31-4461-8d47-c38df184ab4e',
    title: 'adfasfd',
    snippet: 'asdfasdfasdf asf as fa sf asf as df',
    status: 'READY TO PUBLISH',
    visibility: 'PRIVATE',
    lastUpdated: '2025-10-28',
    authorId: '2',
    //- Fix: Added missing properties to satisfy Document type.
    ownerId: '2',
    accessList: ['2'],
  },
   {
    id: 'c82a1b9e-7f4d-4e2b-9e4a-5f8c7d6e5b4a',
    title: 'Exploring the Cosmos',
    snippet: 'A deep dive into the latest discoveries in space.',
    status: 'DRAFT',
    visibility: 'PUBLIC',
    lastUpdated: '2025-10-27',
    authorId: '3',
    //- Fix: Added missing properties to satisfy Document type.
    ownerId: '3',
    accessList: ['3'],
  },
  {
    id: 'd93b2c8f-8g5e-5f3c-a05b-6g9d8e7f6c5b',
    title: 'The Art of Cooking',
    snippet: 'Learn the secrets behind delicious meals.',
    status: 'READY TO PUBLISH',
    visibility: 'PUBLIC',
    lastUpdated: '2025-10-26',
    authorId: '4',
    //- Fix: Added missing properties to satisfy Document type.
    ownerId: '4',
    accessList: ['4'],
  },
];
