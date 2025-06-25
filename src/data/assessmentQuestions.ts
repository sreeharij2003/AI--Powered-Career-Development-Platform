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
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  skills: string[];
  questions: Question[];
}

export const assessments: Assessment[] = [
  {
    id: 1,
    title: "Frontend Development Skills",
    description: "Test your knowledge of React, HTML, CSS, and JavaScript",
    difficulty: "Intermediate",
    estimatedTime: "45 minutes",
    skills: ["React", "JavaScript", "CSS", "HTML"],
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
        question: "Which CSS property is used to create space between elements?",
        options: [
          "padding",
          "margin",
          "spacing",
          "gap"
        ],
        correctAnswer: 1,
        explanation: "Margin is used to create space between elements, while padding creates space inside an element."
      },
      {
        id: 3,
        question: "What is the purpose of the useEffect hook in React?",
        options: [
          "To handle form submissions",
          "To perform side effects in functional components",
          "To create new components",
          "To style components"
        ],
        correctAnswer: 1,
        explanation: "useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM."
      }
    ]
  },
  {
    id: 2,
    title: "Backend Development Skills",
    description: "Test your knowledge of Node.js, Express, and databases",
    difficulty: "Advanced",
    estimatedTime: "60 minutes",
    skills: ["Node.js", "Express", "MongoDB", "SQL"],
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
        question: "Which of the following is NOT a valid MongoDB query operator?",
        options: [
          "$gt",
          "$lt",
          "$between",
          "$in"
        ],
        correctAnswer: 2,
        explanation: "$between is not a valid MongoDB operator. The correct operator for range queries is $gte (greater than or equal) and $lte (less than or equal)."
      },
      {
        id: 3,
        question: "What is the purpose of connection pooling in database management?",
        options: [
          "To store database backups",
          "To manage multiple database connections efficiently",
          "To encrypt database connections",
          "To compress database data"
        ],
        correctAnswer: 1,
        explanation: "Connection pooling is a technique used to manage and reuse database connections, improving performance by reducing the overhead of creating new connections."
      }
    ]
  },
  {
    id: 3,
    title: "System Design & Architecture",
    description: "Test your knowledge of software architecture and system design principles",
    difficulty: "Advanced",
    estimatedTime: "60 minutes",
    skills: ["System Design", "Architecture", "Scalability", "Microservices"],
    questions: [
      {
        id: 1,
        question: "What is the main purpose of a load balancer?",
        options: [
          "To store data",
          "To distribute incoming network traffic across multiple servers",
          "To encrypt data",
          "To compress data"
        ],
        correctAnswer: 1,
        explanation: "A load balancer distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed, improving reliability and performance."
      },
      {
        id: 2,
        question: "Which of the following is a characteristic of microservices architecture?",
        options: [
          "Tight coupling between services",
          "Shared database between all services",
          "Independent deployment of services",
          "Single codebase for all services"
        ],
        correctAnswer: 2,
        explanation: "Microservices architecture allows services to be deployed independently, enabling faster development and deployment cycles."
      },
      {
        id: 3,
        question: "What is the purpose of a circuit breaker pattern?",
        options: [
          "To break the circuit in case of electrical issues",
          "To prevent cascading failures in distributed systems",
          "To stop all services in case of an error",
          "To break the connection between services"
        ],
        correctAnswer: 1,
        explanation: "The circuit breaker pattern prevents cascading failures by stopping the flow of requests to a failing service, allowing it to recover."
      }
    ]
  },
  {
    id: 4,
    title: "DevOps & Cloud",
    description: "Test your knowledge of DevOps practices and cloud platforms",
    difficulty: "Intermediate",
    estimatedTime: "45 minutes",
    skills: ["DevOps", "AWS", "Docker", "CI/CD"],
    questions: [
      {
        id: 1,
        question: "What is the main purpose of Docker?",
        options: [
          "To write code",
          "To containerize applications",
          "To deploy to the cloud",
          "To manage databases"
        ],
        correctAnswer: 1,
        explanation: "Docker is a platform for developing, shipping, and running applications in containers, ensuring consistency across different environments."
      },
      {
        id: 2,
        question: "Which AWS service is used for serverless computing?",
        options: [
          "EC2",
          "Lambda",
          "S3",
          "RDS"
        ],
        correctAnswer: 1,
        explanation: "AWS Lambda is a serverless computing service that lets you run code without provisioning or managing servers."
      },
      {
        id: 3,
        question: "What is the purpose of CI/CD?",
        options: [
          "To write code",
          "To automate the software delivery process",
          "To manage databases",
          "To design user interfaces"
        ],
        correctAnswer: 1,
        explanation: "CI/CD (Continuous Integration/Continuous Deployment) automates the process of building, testing, and deploying applications."
      }
    ]
  },
  {
    id: 5,
    title: "Data Structures & Algorithms",
    description: "Test your knowledge of fundamental computer science concepts",
    difficulty: "Advanced",
    estimatedTime: "60 minutes",
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
        question: "Which data structure is best for implementing a queue?",
        options: [
          "Array",
          "Linked List",
          "Binary Tree",
          "Hash Table"
        ],
        correctAnswer: 1,
        explanation: "A linked list is ideal for implementing a queue because it allows efficient insertion and deletion at both ends."
      },
      {
        id: 3,
        question: "What is the space complexity of merge sort?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n²)"
        ],
        correctAnswer: 1,
        explanation: "Merge sort requires O(n) additional space to store the temporary arrays during the merging process."
      }
    ]
  }
]; 