export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Assessment {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  skills: string[];
  questions: Question[];
}

export const assessments: Assessment[] = [
  {
    id: 1,
    title: "Frontend Development Skills",
    description: "Comprehensive test covering React, JavaScript, HTML, CSS, and modern frontend practices",
    difficulty: "Intermediate",
    estimatedTime: "25 minutes",
    skills: ["React", "JavaScript", "CSS", "HTML", "Frontend Architecture"],
    questions: [
      {
        id: 1,
        question: "What is the correct way to create a React functional component?",
        options: [
          "function MyComponent() { return <div>Hello</div> }",
          "class MyComponent extends React.Component { render() { return <div>Hello</div> } }",
          "const MyComponent = () => { return <div>Hello</div> }",
          "Both A and C are correct"
        ],
        correctAnswer: 3,
        explanation: "Both function declarations and arrow functions can be used to create functional components in React."
      },
      {
        id: 2,
        question: "Which hook is used to manage state in functional components?",
        options: [
          "useEffect",
          "useState",
          "useContext",
          "useReducer"
        ],
        correctAnswer: 1,
        explanation: "useState is the primary hook for managing local state in functional components."
      },
      {
        id: 3,
        question: "What is the purpose of useEffect hook?",
        options: [
          "To manage component state",
          "To handle side effects and lifecycle events",
          "To create context providers",
          "To optimize component rendering"
        ],
        correctAnswer: 1,
        explanation: "useEffect is used to handle side effects like API calls, subscriptions, and lifecycle events in functional components."
      },
      {
        id: 4,
        question: "Which CSS property is used to create a flexbox container?",
        options: [
          "display: block",
          "display: flex",
          "display: grid",
          "display: inline"
        ],
        correctAnswer: 1,
        explanation: "display: flex creates a flex container, enabling flexbox layout for its children."
      },
      {
        id: 5,
        question: "What does the 'key' prop do in React lists?",
        options: [
          "It styles the list items",
          "It helps React identify which items have changed",
          "It sets the order of items",
          "It makes items clickable"
        ],
        correctAnswer: 1,
        explanation: "The key prop helps React identify which items have changed, are added, or are removed, improving performance."
      },
      {
        id: 6,
        question: "Which method is used to prevent the default behavior of an event?",
        options: [
          "event.stopPropagation()",
          "event.preventDefault()",
          "event.stopDefault()",
          "event.cancel()"
        ],
        correctAnswer: 1,
        explanation: "event.preventDefault() prevents the default action associated with the event from occurring."
      },
      {
        id: 7,
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: [
          "No difference",
          "=== checks type and value, == only checks value",
          "== checks type and value, === only checks value",
          "=== is faster than =="
        ],
        correctAnswer: 1,
        explanation: "=== (strict equality) checks both type and value, while == (loose equality) performs type coercion."
      },
      {
        id: 8,
        question: "Which CSS unit is relative to the viewport width?",
        options: [
          "px",
          "em",
          "vw",
          "rem"
        ],
        correctAnswer: 2,
        explanation: "vw (viewport width) is a unit relative to 1% of the viewport's width."
      },
      {
        id: 9,
        question: "What is the purpose of React.memo()?",
        options: [
          "To memorize component state",
          "To prevent unnecessary re-renders",
          "To cache API responses",
          "To store component data"
        ],
        correctAnswer: 1,
        explanation: "React.memo() is a higher-order component that prevents unnecessary re-renders by memoizing the result."
      },
      {
        id: 10,
        question: "Which HTML5 semantic element represents the main content?",
        options: [
          "<section>",
          "<article>",
          "<main>",
          "<div>"
        ],
        correctAnswer: 2,
        explanation: "<main> represents the dominant content of the document body, excluding headers, footers, and sidebars."
      },
      {
        id: 11,
        question: "What is the purpose of the 'async/await' syntax?",
        options: [
          "To create synchronous code",
          "To handle asynchronous operations more readably",
          "To improve performance",
          "To handle errors"
        ],
        correctAnswer: 1,
        explanation: "async/await provides a more readable way to handle asynchronous operations compared to promises and callbacks."
      },
      {
        id: 12,
        question: "Which CSS property controls the stacking order of elements?",
        options: [
          "position",
          "z-index",
          "order",
          "layer"
        ],
        correctAnswer: 1,
        explanation: "z-index controls the stacking order of positioned elements along the z-axis."
      },
      {
        id: 13,
        question: "What is the Virtual DOM in React?",
        options: [
          "A copy of the real DOM stored in memory",
          "A faster version of the DOM",
          "A debugging tool",
          "A testing framework"
        ],
        correctAnswer: 0,
        explanation: "The Virtual DOM is a JavaScript representation of the real DOM kept in memory and synced with the real DOM."
      },
      {
        id: 14,
        question: "Which array method creates a new array with all elements that pass a test?",
        options: [
          "map()",
          "filter()",
          "reduce()",
          "forEach()"
        ],
        correctAnswer: 1,
        explanation: "filter() creates a new array with all elements that pass the test implemented by the provided function."
      },
      {
        id: 15,
        question: "What is the purpose of CSS Grid?",
        options: [
          "To create responsive images",
          "To create two-dimensional layouts",
          "To animate elements",
          "To style text"
        ],
        correctAnswer: 1,
        explanation: "CSS Grid is designed for creating two-dimensional layouts, allowing control over both rows and columns."
      }
    ]
  },
  {
    id: 2,
    title: "Backend Development Skills",
    description: "In-depth assessment of Node.js, Express, databases, and server-side development",
    difficulty: "Advanced",
    estimatedTime: "30 minutes",
    skills: ["Node.js", "Express", "MongoDB", "SQL", "API Development"],
    questions: [
      {
        id: 1,
        question: "What is middleware in Express.js?",
        options: [
          "A database connection",
          "Functions that have access to request and response objects",
          "A type of route handler",
          "A template engine"
        ],
        correctAnswer: 1,
        explanation: "Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle."
      },
      {
        id: 2,
        question: "Which HTTP status code indicates a successful POST request that created a resource?",
        options: [
          "200 OK",
          "201 Created",
          "204 No Content",
          "202 Accepted"
        ],
        correctAnswer: 1,
        explanation: "201 Created indicates that the request has been fulfilled and resulted in a new resource being created."
      },
      {
        id: 3,
        question: "What is the purpose of the 'next' parameter in Express middleware?",
        options: [
          "To get the next request",
          "To pass control to the next middleware function",
          "To get the next response",
          "To create a new route"
        ],
        correctAnswer: 1,
        explanation: "The 'next' parameter is a function that passes control to the next middleware function in the stack."
      },
      {
        id: 4,
        question: "Which MongoDB method is used to find documents that match a query?",
        options: [
          "findOne()",
          "find()",
          "search()",
          "query()"
        ],
        correctAnswer: 1,
        explanation: "find() returns all documents that match the query criteria, while findOne() returns only the first match."
      },
      {
        id: 5,
        question: "What is the difference between SQL and NoSQL databases?",
        options: [
          "SQL is faster than NoSQL",
          "SQL uses structured data with schemas, NoSQL is more flexible",
          "NoSQL is always better for web applications",
          "There is no difference"
        ],
        correctAnswer: 1,
        explanation: "SQL databases use structured data with predefined schemas, while NoSQL databases offer more flexibility in data structure."
      },
      {
        id: 6,
        question: "Which Node.js module is used for handling file system operations?",
        options: [
          "path",
          "fs",
          "os",
          "util"
        ],
        correctAnswer: 1,
        explanation: "The 'fs' (file system) module provides an API for interacting with the file system."
      },
      {
        id: 7,
        question: "What is the purpose of environment variables in Node.js?",
        options: [
          "To store user data",
          "To configure application settings without hardcoding",
          "To improve performance",
          "To handle errors"
        ],
        correctAnswer: 1,
        explanation: "Environment variables allow you to configure application settings without hardcoding sensitive information."
      },
      {
        id: 8,
        question: "Which Express.js method is used to handle all HTTP methods for a route?",
        options: [
          "app.get()",
          "app.all()",
          "app.use()",
          "app.route()"
        ],
        correctAnswer: 1,
        explanation: "app.all() handles all HTTP methods (GET, POST, PUT, DELETE, etc.) for a specific route."
      },
      {
        id: 9,
        question: "What is the purpose of indexing in databases?",
        options: [
          "To sort data alphabetically",
          "To improve query performance",
          "To backup data",
          "To encrypt data"
        ],
        correctAnswer: 1,
        explanation: "Database indexes improve query performance by creating efficient data structures for faster lookups."
      },
      {
        id: 10,
        question: "Which HTTP method is idempotent and used for updating resources?",
        options: [
          "POST",
          "PUT",
          "PATCH",
          "DELETE"
        ],
        correctAnswer: 1,
        explanation: "PUT is idempotent, meaning multiple identical requests should have the same effect as a single request."
      },
      {
        id: 11,
        question: "What is the purpose of CORS (Cross-Origin Resource Sharing)?",
        options: [
          "To encrypt data",
          "To allow or restrict web pages to access resources from other domains",
          "To compress responses",
          "To cache responses"
        ],
        correctAnswer: 1,
        explanation: "CORS is a security feature that allows or restricts web pages to access resources from different domains."
      },
      {
        id: 12,
        question: "Which Node.js feature allows handling multiple requests concurrently?",
        options: [
          "Multi-threading",
          "Event loop",
          "Clustering",
          "Load balancing"
        ],
        correctAnswer: 1,
        explanation: "Node.js uses an event loop to handle multiple requests concurrently in a single thread."
      },
      {
        id: 13,
        question: "What is the difference between authentication and authorization?",
        options: [
          "They are the same thing",
          "Authentication verifies identity, authorization determines permissions",
          "Authorization verifies identity, authentication determines permissions",
          "Authentication is for APIs, authorization is for web apps"
        ],
        correctAnswer: 1,
        explanation: "Authentication verifies who you are, while authorization determines what you're allowed to do."
      },
      {
        id: 14,
        question: "Which MongoDB operation is used to update multiple documents?",
        options: [
          "updateOne()",
          "updateMany()",
          "replaceOne()",
          "findAndModify()"
        ],
        correctAnswer: 1,
        explanation: "updateMany() updates all documents that match the specified filter criteria."
      },
      {
        id: 15,
        question: "What is the purpose of connection pooling in databases?",
        options: [
          "To backup connections",
          "To reuse database connections for better performance",
          "To encrypt connections",
          "To monitor connections"
        ],
        correctAnswer: 1,
        explanation: "Connection pooling reuses database connections to improve performance and reduce overhead."
      }
    ]
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    description: "Comprehensive evaluation of fundamental computer science concepts and problem-solving",
    difficulty: "Advanced",
    estimatedTime: "35 minutes",
    skills: ["Algorithms", "Data Structures", "Problem Solving", "Complexity Analysis"],
    questions: [
      {
        id: 1,
        question: "What is the time complexity of binary search?",
        options: [
          "O(n)",
          "O(log n)",
          "O(n log n)",
          "O(n²)"
        ],
        correctAnswer: 1,
        explanation: "Binary search has a time complexity of O(log n) because it divides the search interval in half each time."
      },
      {
        id: 2,
        question: "Which data structure uses LIFO (Last In, First Out) principle?",
        options: [
          "Queue",
          "Stack",
          "Array",
          "Linked List"
        ],
        correctAnswer: 1,
        explanation: "A stack follows the LIFO principle where the last element added is the first one to be removed."
      },
      {
        id: 3,
        question: "What is the worst-case time complexity of quicksort?",
        options: [
          "O(n log n)",
          "O(n²)",
          "O(n)",
          "O(log n)"
        ],
        correctAnswer: 1,
        explanation: "Quicksort has a worst-case time complexity of O(n²) when the pivot is always the smallest or largest element."
      },
      {
        id: 4,
        question: "Which data structure is best for implementing a priority queue?",
        options: [
          "Array",
          "Heap",
          "Stack",
          "Linked List"
        ],
        correctAnswer: 1,
        explanation: "A heap is the most efficient data structure for implementing a priority queue with O(log n) insertion and deletion."
      },
      {
        id: 5,
        question: "What is the space complexity of merge sort?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n log n)"
        ],
        correctAnswer: 1,
        explanation: "Merge sort requires O(n) additional space for the temporary arrays used during the merge process."
      },
      {
        id: 6,
        question: "Which algorithm is used to find the shortest path in a weighted graph?",
        options: [
          "BFS",
          "Dijkstra's algorithm",
          "DFS",
          "Binary search"
        ],
        correctAnswer: 1,
        explanation: "Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph."
      },
      {
        id: 7,
        question: "What is the time complexity of inserting an element at the beginning of an array?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n²)"
        ],
        correctAnswer: 1,
        explanation: "Inserting at the beginning of an array requires shifting all existing elements, resulting in O(n) time complexity."
      },
      {
        id: 8,
        question: "Which data structure allows efficient insertion and deletion at both ends?",
        options: [
          "Stack",
          "Deque (Double-ended queue)",
          "Binary tree",
          "Hash table"
        ],
        correctAnswer: 1,
        explanation: "A deque (double-ended queue) allows efficient O(1) insertion and deletion at both ends."
      },
      {
        id: 9,
        question: "What is the average time complexity of hash table operations?",
        options: [
          "O(1)",
          "O(log n)",
          "O(n)",
          "O(n log n)"
        ],
        correctAnswer: 0,
        explanation: "Hash tables provide O(1) average time complexity for search, insertion, and deletion operations."
      },
      {
        id: 10,
        question: "Which traversal method visits nodes level by level in a binary tree?",
        options: [
          "Inorder",
          "Level-order (BFS)",
          "Preorder",
          "Postorder"
        ],
        correctAnswer: 1,
        explanation: "Level-order traversal (also known as BFS) visits nodes level by level from left to right."
      },
      {
        id: 11,
        question: "What is the time complexity of finding an element in a balanced binary search tree?",
        options: [
          "O(n)",
          "O(log n)",
          "O(1)",
          "O(n log n)"
        ],
        correctAnswer: 1,
        explanation: "In a balanced BST, search operations take O(log n) time due to the tree's height being logarithmic."
      },
      {
        id: 12,
        question: "Which sorting algorithm is stable and has O(n log n) time complexity?",
        options: [
          "Quicksort",
          "Merge sort",
          "Heap sort",
          "Selection sort"
        ],
        correctAnswer: 1,
        explanation: "Merge sort is stable (maintains relative order of equal elements) and has guaranteed O(n log n) time complexity."
      },
      {
        id: 13,
        question: "What is the purpose of dynamic programming?",
        options: [
          "To sort data efficiently",
          "To solve problems by breaking them into overlapping subproblems",
          "To search in graphs",
          "To manage memory allocation"
        ],
        correctAnswer: 1,
        explanation: "Dynamic programming solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant calculations."
      },
      {
        id: 14,
        question: "Which data structure is used to detect cycles in a graph?",
        options: [
          "Stack",
          "Union-Find (Disjoint Set)",
          "Queue",
          "Array"
        ],
        correctAnswer: 1,
        explanation: "Union-Find data structure is commonly used to detect cycles in undirected graphs efficiently."
      },
      {
        id: 15,
        question: "What is the time complexity of the bubble sort algorithm?",
        options: [
          "O(n log n)",
          "O(n²)",
          "O(n)",
          "O(log n)"
        ],
        correctAnswer: 1,
        explanation: "Bubble sort has O(n²) time complexity in both average and worst cases due to nested loops."
      }
    ]
  }
];

// Career domain specific questions for career path prediction
export const TECHNOLOGY_QUESTIONS = [
  {
    id: 1,
    question: "Which programming paradigm do you prefer?",
    options: ["Object-Oriented Programming", "Functional Programming", "Procedural Programming", "Event-Driven Programming"],
    weight: 1
  },
  {
    id: 2,
    question: "What type of technology projects interest you most?",
    options: ["Web Applications", "Mobile Apps", "Data Analysis", "AI/Machine Learning"],
    weight: 1
  },
  {
    id: 3,
    question: "How do you prefer to work?",
    options: ["Frontend Development", "Backend Development", "Full-Stack Development", "DevOps/Infrastructure"],
    weight: 1
  },
  {
    id: 4,
    question: "What motivates you in technology?",
    options: ["Solving Complex Problems", "Creating User Experiences", "Building Scalable Systems", "Analyzing Data Patterns"],
    weight: 1
  },
  {
    id: 5,
    question: "Which technology stack appeals to you?",
    options: ["JavaScript/React/Node.js", "Python/Django/Flask", "Java/Spring", "C#/.NET"],
    weight: 1
  }
];

export const BUSINESS_QUESTIONS = [
  {
    id: 1,
    question: "What aspect of business interests you most?",
    options: ["Strategy & Planning", "Marketing & Sales", "Operations & Management", "Finance & Analysis"],
    weight: 1
  },
  {
    id: 2,
    question: "How do you prefer to interact with people?",
    options: ["Leading Teams", "Client Relations", "Networking", "Training & Development"],
    weight: 1
  },
  {
    id: 3,
    question: "What type of business environment do you thrive in?",
    options: ["Startup/Entrepreneurial", "Corporate/Enterprise", "Consulting", "Non-Profit"],
    weight: 1
  },
  {
    id: 4,
    question: "Which business function appeals to you?",
    options: ["Product Management", "Business Development", "Project Management", "Human Resources"],
    weight: 1
  },
  {
    id: 5,
    question: "What drives your business decisions?",
    options: ["Data & Analytics", "Market Trends", "Customer Feedback", "Innovation"],
    weight: 1
  }
];

export const HEALTHCARE_QUESTIONS = [
  {
    id: 1,
    question: "What aspect of healthcare motivates you?",
    options: ["Direct Patient Care", "Medical Research", "Healthcare Technology", "Public Health"],
    weight: 1
  },
  {
    id: 2,
    question: "How do you prefer to help people?",
    options: ["Clinical Treatment", "Preventive Care", "Mental Health Support", "Emergency Response"],
    weight: 1
  },
  {
    id: 3,
    question: "What healthcare setting interests you?",
    options: ["Hospitals", "Private Practice", "Research Labs", "Community Health Centers"],
    weight: 1
  },
  {
    id: 4,
    question: "Which healthcare specialization appeals to you?",
    options: ["General Medicine", "Specialized Surgery", "Pediatrics", "Geriatrics"],
    weight: 1
  },
  {
    id: 5,
    question: "What healthcare challenge do you want to address?",
    options: ["Disease Treatment", "Health Education", "Medical Innovation", "Healthcare Access"],
    weight: 1
  }
];

export const EDUCATION_QUESTIONS = [
  {
    id: 1,
    question: "What age group do you prefer to teach?",
    options: ["Early Childhood", "Elementary", "Secondary/High School", "Adult/Higher Education"],
    weight: 1
  },
  {
    id: 2,
    question: "What subject area interests you most?",
    options: ["STEM (Science, Technology, Engineering, Math)", "Liberal Arts & Humanities", "Social Sciences", "Arts & Creative"],
    weight: 1
  },
  {
    id: 3,
    question: "How do you prefer to impact education?",
    options: ["Direct Teaching", "Curriculum Development", "Educational Administration", "Educational Technology"],
    weight: 1
  },
  {
    id: 4,
    question: "What educational setting appeals to you?",
    options: ["Traditional Classroom", "Online/Remote Learning", "Special Education", "Corporate Training"],
    weight: 1
  },
  {
    id: 5,
    question: "What educational challenge do you want to address?",
    options: ["Student Engagement", "Learning Accessibility", "Educational Equity", "Innovation in Teaching"],
    weight: 1
  }
];

export const CREATIVE_QUESTIONS = [
  {
    id: 1,
    question: "What type of creative work excites you?",
    options: ["Visual Design", "Writing & Content", "Music & Audio", "Film & Video"],
    weight: 1
  },
  {
    id: 2,
    question: "How do you prefer to express creativity?",
    options: ["Digital Art & Design", "Traditional Art", "Performance", "Interactive Media"],
    weight: 1
  },
  {
    id: 3,
    question: "What creative medium do you gravitate toward?",
    options: ["Graphic Design", "Photography", "Illustration", "3D Modeling"],
    weight: 1
  },
  {
    id: 4,
    question: "What creative environment suits you?",
    options: ["Agency/Studio", "Freelance", "In-House Creative Team", "Entertainment Industry"],
    weight: 1
  },
  {
    id: 5,
    question: "What creative impact do you want to make?",
    options: ["Brand Identity", "Storytelling", "User Experience", "Artistic Expression"],
    weight: 1
  }
];

export const SCIENCE_QUESTIONS = [
  {
    id: 1,
    question: "What scientific field interests you most?",
    options: ["Life Sciences/Biology", "Physical Sciences/Physics", "Earth & Environmental Sciences", "Chemistry"],
    weight: 1
  },
  {
    id: 2,
    question: "How do you prefer to conduct research?",
    options: ["Laboratory Research", "Field Studies", "Theoretical Analysis", "Applied Research"],
    weight: 1
  },
  {
    id: 3,
    question: "What scientific application appeals to you?",
    options: ["Medical Research", "Environmental Conservation", "Technology Development", "Space Exploration"],
    weight: 1
  },
  {
    id: 4,
    question: "What research environment suits you?",
    options: ["Academic Research", "Industry R&D", "Government Labs", "Non-Profit Research"],
    weight: 1
  },
  {
    id: 5,
    question: "What scientific challenge do you want to tackle?",
    options: ["Climate Change", "Disease & Health", "Energy Solutions", "Space & Universe"],
    weight: 1
  }
];
