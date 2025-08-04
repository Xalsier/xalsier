// Character Research Books
const characterResearchBooks = {
    currentlyReading: [
      {
        title: "Orientalism",
        author: "Edward Said",
        rating: null,
        tags: ["Roxie Research", "Eun-byul Research"],
      },
    ],
    wantToRead: [
      {
        title: "A Vietcong Memoir: An Inside Account of the Vietnam War and Its Aftermath",
        author: "Tang, Truong Nhu",
        rating: null,
        tags: ["Roxie Research", "Eun-byul Research"],
      },
    ],
    completed: [
      {
        author: "Southwell, Gareth",
        title: "What Would Marx Do?: How the Greatest Political Theorists Would Solve Your Everyday Problems.",
        rating: 4,
        tags: ["Socialism", "Philosophy", "Eun-byul Research", "Roxie Research"],
        read: "Jun 16, 2025",
        mini: "This is the first book I picked up to learn about communism in my research studies to write Eun-byul, although it really is more about philosophy. It's a very accessible read and has a lot of interesting scenarios that give the author an excuse (or launching point) to explore a different philosophical subject.",
      },
      {
        author: "Marx, Karl",
        title: "The Communist Manifesto.",
        rating: 3,
        tags: ["Socialism", "Eun-byul Research", "Roxie Research"],
        read: "Apr 18, 2025",
      },
      {
        author: "Ross, Kristin",
        title: "Communal Luxury: The Political Imaginary of the Paris Commune",
        rating: 3,
        tags: ["Socialism", "History", "Eun-byul Research", "Roxie Research"],
        read: "Jun 12, 2025",
      },
      {
        author: "Lenin, Vladimir",
        title: "The State and Revolution",
        rating: 3,
        tags: ["Socialism", "Eun-byul Research", "Roxie Research"],
        read: "May 28, 2025",
      },
      {
        author: "Freire, Paulo",
        title: "Pedagogy of the Oppressed",
        rating: 2,
        tags: ["Philosophy", "Eun-byul Research", "Roxie Research"],
        read: "Apr 28, 2025",
        mini: "Also repetitive (So many looping metaphors about praxis), but there is enough content here that I'm giving it a point because I found some of the quotes useful while writing Eun-byul.",
      },
      {
        author: "Kyabgon, Traleg",
        title: "Karma: What It Is, What It Isn't, Why It Matters",
        rating: 2,
        tags: ["Philosophy", "Eun-byul Research", "Roxie Research"],
        read: "May 10, 2025",
      },
      {
        author: "Engels, Friedrich",
        title: "Socialism: Utopian and Scientific",
        rating: 1,
        tags: ["Socialism", "Eun-byul Research", "Roxie Research"],
        read: "Jun 11, 2025",
      },
    ],
  }

  
  // Manga & Comics Data
  const mangaComicsData = {
    kingdomHearts: {
      title: "Kingdom Hearts II",
      totalVolumes: 10,
      readVolumes: [1],
      volumes: [
        { number: 1, read: false },
        {
          number: 2,
          read: true,
          rating: 2,
          mini: "The fight scenes in game helped with the pacing between these cutscenes. Spliced together in a comic like this, it feels a little disorienting.",
          read_date: "Jul 28, 2025",
        },
        { number: 3, read: false },
        { number: 4, read: false },
        { number: 5, read: false },
        { number: 6, read: false },
        { number: 7, read: false },
        { number: 8, read: false },
        { number: 9, read: false },
        { number: 10, read: false },
      ],
    },
    demonSlayer: {
      title: "Demon Slayer",
      totalVolumes: 23,
      readVolumes: [1],
      volumes: Array.from({ length: 23 }, (_, i) => ({
        number: i + 1,
        read: i + 1 === 6,
        ...(i + 1 === 6 && {
          rating: 3,
          read_date: "Jul 28, 2025",
        }),
      })),
    },
    beastars: {
      title: "Beastars",
      totalVolumes: 22,
      readVolumes: [1],
      volumes: [
        {
          number: 1,
          read: true,
          rating: 5,
          mini: "I read this while indoor biking. I feel like it's a good sign that I couldn't even tell my legs were starting to ache while cycling. The volume was well paced.",
          read_date: "Aug 4, 2025",
        },
        { number: 2, read: false },
        { number: 3, read: false },
        { number: 4, read: false },
        { number: 5, read: false },
        { number: 6, read: false },
        { number: 7, read: false },
        { number: 8, read: false },
        { number: 9, read: false },
        { number: 10, read: false },
        { number: 11, read: false },
        { number: 12, read: false },
        { number: 13, read: false },
        { number: 14, read: false },
        { number: 15, read: false },
        { number: 16, read: false },
        { number: 17, read: false },
        { number: 18, read: false },
        { number: 19, read: false },
        { number: 20, read: false },
        { number: 21, read: false },
        { number: 22, read: false },
      ],
    },
  }
  
  // Unsorted Books
  const unsortedBooks = [
    {
      author: "Iris Chang",
      title: "The Rape of Nanking: The Forgotten Holocaust of World War II",
      rating: 5,
      tags: ["History"],
      read: "Apr 22, 2025",
      mini: "This was the first history book that I picked up as an audiobook. It's a very graphic and sensitive read so the book might not be for everyone, but it is fairly well written and has value in terms of raising awareness about what happened.",
    },
    {
      author: "Judith, Anodea",
      title: "Eastern Body, Western Mind: Psychology and the Chakra System as a Path to the Self",
      rating: 3,
      tags: ["Philosophy", "Psychology"],
      read: "Dec 13, 2022",
    },
    {
      author: "Kolk, Bessel van der",
      title: "The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma",
      rating: 3,
      tags: ["Psychology"],
      read: "Jan 28, 2023",
    },
    {
      author: "Nguyen, Qui",
      title: "She Kills Monsters",
      rating: 1,
      tags: ["Plays", "Fiction"],
      read: "Jun 19, 2025",
      mini: "Did you know I played Orcus at my school play? ^-^. After a reread I didn't really like the writing, but it was fun on stage..",
      images: [
        {
          src: "./img/car/orcus.png",
          caption: "21 Feb, 2019. This is how I looked in costume!",
        },
      ],
    },
    {
      author: "Machiavelli, Niccolò",
      title: "The Prince",
      rating: 1,
      tags: ["Philosophy"],
      read: "Feb 05, 2023",
    },
    {
        author: "Schalk, Sami",
        title: "Black Disability Politics",
        rating: 3,
        tags: ["History", "Disability"],
        read: "July 30, 2025",
        mini: "I really like Imani Barbarin's reading of this. I picked it up with an interest to learn a little bit about the veteran that went through psychosurgery that resulted in lifelong disablement. There were also some historical events mentioned in this book such as the 504 Sit in, and the articles written by the Black Panther Party, that I had no idea about until I listened to the audiobook.",
        status: "completed",
      },
      {
        author: "Seneca",
        title: "How to Do the Right Thing: An Ancient Guide to Treating People Fairly",
        rating: 1,
        tags: ["Philosophy"],
        read: "Dec 09, 2023",
        status: "completed",
      },
      {
        author: "Aurelius, Marcus",
        title: "The Emperor's Handbook",
        rating: 2,
        tags: ["Philosophy"],
        read: "Jul 17, 2025",
        mini: "Very repetitive and a painful audiobook listen, but I liked some of the things he said about nature. I'm giving this an extra point because the audiobook speakers were very good and the introduction brief was well written.",
        status: "completed",
      },
  ]
  
  // Character Quotes Data
  const characterQuotes = [
    {
      text: "Maybe I know the reason you're so eager to [..] dehumanize her by calling her a thing. Its because you have [ experience ].",
      character: "Eun-byul",
      type: "quote",
    },
    {
      text: "He doesn't care about the community. He really does want [ her ] to suffer [...]. What a selfish greedy prick, keeping that to himself so that he can take a faux-moralist posture.",
      character: "Eun-byul",
      type: "thought",
    },
      {
        text: "You didn't build anything, didn't write an autobiography. You sure as hell didn't tell the news, or publish anything about that book. You didn't embed yourself as a staff worker. And you didn't coordinate the protestsー",
        character: "Eun-byul",
        type: "quote",
      },
      {
        text: "You had 5 years. 5 goddamn years- you have no place to act entitled- We only know what we know. And you kept this a secret until NOW? No wonder this happened. [...] Maybe even worse, because I can see right through you. Your complicit. Only the enemy would keep secrets [...]",
        character: "Eun-byul",
        type: "quote",
      },
  ]
  