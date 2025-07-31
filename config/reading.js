const currentlyReading = [
  {
    title: "Orientalism by Edward Said",
    rating: null,
  }
];

const reviews = [
  {
    author: 'Iris Chang',
    title: 'The Rape of Nanking: The Forgotten Holocaust of World War II',
    rating: 5,
    tags: ['History'],
    read: "Apr 22, 2025",
    mini: "This was the first history book that I picked up as an audiobook. It's a very graphic and sensitive read so the book might not be for everyone, but it is fairly well written and has value in terms of raising awareness about what happened."
  },
  {
    author: 'Southwell, Gareth',
    title: 'What Would Marx Do?: How the Greatest Political Theorists Would Solve Your Everyday Problems.',
    rating: 4,
    tags: ['Socialism', 'Philosophy', 'Eun-byul Research'],
    read: "Jun 16, 2025",
    mini: "This is the first book I picked up to learn about communism in my research studies to write Eun-byul, although it really is more about philosophy. It's a very accessible read and has a lot of interesting scenarios that give the author an excuse (or launching point) to explore a different philosophical subject."
  },
  {
    author: 'Hunter, Erin',
    title: 'The Rise of Scourge',
    rating: 4,
    tags: ['Comics', 'Fiction'],
    read: 'Jul 29, 2025', // or whatever date
    mini: "I read this comic back in my earlier years in education so it was a fun experience picking it back up to remember the backstory of Scourge. I really liked the pacing, and it was easy to follow the story from start to finish."
  },
  {
    author: 'Marx, Karl',
    title: 'The Communist Manifesto.',
    rating: 3,
    tags: ['Socialism', 'Eun-byul Research'],
    read: "Apr 18, 2025"
  },
  {
    author: 'Schalk, Sami',
    title: 'Black Disability Politics',
    rating: 3,
    tags: ['History', 'Disability'],
    read: "July 30, 2025",
    mini: "I really like Imani Barbarin's reading of this. I picked it up with an interest to learn a little bit about the veteran that went through psychosurgery that resulted in lifelong disablement. There were also some historical events mentioned in this book such as the 504 Sit in, and the articles written by the Black Panther Party, that I had no idea about until I listened to the audiobook."
  },
  {
    author: 'Ross, Kristin',
    title: 'Communal Luxury: The Political Imaginary of the Paris Commune',
    rating: 3,
    tags: ['Socialism', 'History', 'Eun-byul Research'],
    read: "Jun 12, 2025"
  },
  {
    author: 'Judith, Anodea',
    title: 'Eastern Body, Western Mind: Psychology and the Chakra System as a Path to the Self',
    rating: 3,
    tags: ['Philosophy', 'Psychology'],
    read: "Dec 13, 2022"
  },
  {
    author: 'Lenin, Vladimir',
    title: 'The State and Revolution',
    rating: 3,
    tags: ['Socialism', 'Eun-byul Research'],
    read: "May 28, 2025",
  },
  {
    author: 'Gotouge, Koyoharu',
    title: 'Demon Slayer, Vol. 6',
    rating: 3,
    tags: ['Comics', 'Fiction'], 
    read: "Jul 28, 2025"
  },
  {
    author: 'Kolk, Bessel van der',
    title: 'The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma',
    rating: 3,
    tags: ['Psychology'],
    read: "Jan 28, 2023"
  },
  {
    author: 'Freire, Paulo',
    title: 'Pedagogy of the Oppressed',
    rating: 2,
    tags: ['Philosophy', 'Eun-byul Research'],
    read: "Apr 28, 2025",
    mini: "Also repetitive (So many looping metaphors about praxis), but there is enough content here that I'm giving it a point because I found some of the quotes useful while writing Eun-byul."
  },
  {
    author: 'Amano, Shiro',
    title: 'Kingdom Hearts II, Vol. 2',
    rating: 2,
    tags: ['Comics', 'Fiction'],
    read: "Jul 28, 2025",
    mini: "The fight scenes in game helped with the pacing between these cutscenes. Spliced together in a comic like this, it feels a little disorienting."
  },
  {
    author: 'Kyabgon, Traleg',
    title: "Karma: What It Is, What It Isn't, Why It Matters",
    rating: 2,
    tags: ['Philosophy', 'Eun-byul Research'],
    read: "May 10, 2025"
  },
  {
    author: 'Aurelius, Marcus',
    title: "The Emperor's Handbook",
    rating: 2,
    tags: ['Philosophy'],
    read: "Jul 17, 2025",
    mini: "Very repetitive and a painful audiobook listen, but I liked some of the things he said about nature. I'm giving this an extra point because the audiobook speakers were very good and the introduction brief was well written."
  },
  {
    author: 'Engels, Friedrich',
    title: 'Socialism: Utopian and Scientific',
    rating: 1,
    tags: ['Socialism', 'Eun-byul Research'],
    read: "Jun 11, 2025"
  },
  {
    author: 'Nguyen, Qui',
    title: 'She Kills Monsters',
    rating: 1,
    tags: ['Plays', 'Fiction'],
    read: "Jun 19, 2025",
    mini: "Did you know I played Orcus at my school play? ^-^. After a reread I didn't really like the writing, but it was fun on stage.."
  },
  {
    author: 'Machiavelli, Niccolò',
    title: 'The Prince',
    rating: 1,
    tags: ['Philosophy'],
    read: "Feb 05, 2023"
  },
  {
    author: 'Seneca',
    title: 'How to Do the Right Thing: An Ancient Guide to Treating People Fairly',
    rating: 1,
    tags: ['Philosophy'],
    read: "Dec 09, 2023"
  }
];