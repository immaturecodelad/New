import React from 'react';
import { 
  Binary, 
  Box, 
  Database, 
  Cpu, 
  Network, 
  Microchip, 
  Repeat, 
  FileCode, 
  GitPullRequest, 
  Pi, 
  Brain,
  LucideIcon
} from 'lucide-react';

export interface CseSubject {
  id: string;
  name: string;
  shortName: string;
  description: string;
  subTopics: string[];
  icon: LucideIcon;
  colorName: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  cardHoverBorder: string;
  accentGradient: string;
}

export const CSE_SUBJECTS: CseSubject[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming & Complexity Analysis',
    subTopics: [
      'Arrays & Linked Lists',
      'Trees & Graphs',
      'Sorting & Searching',
      'Dynamic Programming',
      'Complexity Analysis'
    ],
    icon: Binary,
    colorName: 'indigo',
    chipBg: 'bg-indigo-50',
    chipText: 'text-indigo-700',
    chipBorder: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    cardBorder: 'border-indigo-100',
    cardHoverBorder: 'hover:border-indigo-300',
    accentGradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    shortName: 'OOP',
    description: 'Classes, Inheritance, Polymorphism, Design Patterns & Clean Code',
    subTopics: [
      'Classes & Objects',
      'Inheritance & Polymorphism',
      'Design Patterns',
      'Exception Handling',
      'Encapsulation & Abstraction'
    ],
    icon: Box,
    colorName: 'emerald',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    chipBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    cardBorder: 'border-emerald-100',
    cardHoverBorder: 'hover:border-emerald-300',
    accentGradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'dbms',
    name: 'Database Management Systems (DBMS)',
    shortName: 'DBMS',
    description: 'Relational Schemas, SQL Queries, Normalization, ACID & Indexing',
    subTopics: [
      'SQL',
      'Normalization',
      'Transactions & ACID',
      'Indexing',
      'ER Model'
    ],
    icon: Database,
    colorName: 'amber',
    chipBg: 'bg-amber-50',
    chipText: 'text-amber-800',
    chipBorder: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    cardBorder: 'border-amber-100',
    cardHoverBorder: 'hover:border-amber-300',
    accentGradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'os',
    name: 'Operating Systems',
    shortName: 'OS',
    description: 'Process Scheduling, Memory Management, Deadlocks & Synchronization',
    subTopics: [
      'Process Scheduling',
      'Deadlocks',
      'Memory Management',
      'Paging',
      'Synchronization'
    ],
    icon: Cpu,
    colorName: 'rose',
    chipBg: 'bg-rose-50',
    chipText: 'text-rose-700',
    chipBorder: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    cardBorder: 'border-rose-100',
    cardHoverBorder: 'hover:border-rose-300',
    accentGradient: 'from-rose-500 to-red-600'
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    shortName: 'Networks',
    description: 'OSI/TCP-IP Stack, Routing Algorithms, Transport Layer & Subnetting',
    subTopics: [
      'OSI/TCP-IP',
      'Routing',
      'Transport Layer',
      'Subnetting',
      'Application Layer'
    ],
    icon: Network,
    colorName: 'cyan',
    chipBg: 'bg-cyan-50',
    chipText: 'text-cyan-800',
    chipBorder: 'border-cyan-200',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-900',
    cardBorder: 'border-cyan-100',
    cardHoverBorder: 'hover:border-cyan-300',
    accentGradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    shortName: 'COA',
    description: 'Instruction Sets, Pipelining, Cache Hierarchy & CPU Datapaths',
    subTopics: [
      'Instruction Set Architecture',
      'Pipelining',
      'Cache Memory',
      'CPU Organization',
      'I/O Interfacing'
    ],
    icon: Microchip,
    colorName: 'violet',
    chipBg: 'bg-violet-50',
    chipText: 'text-violet-700',
    chipBorder: 'border-violet-200',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    cardBorder: 'border-violet-100',
    cardHoverBorder: 'hover:border-violet-300',
    accentGradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    shortName: 'TOC',
    description: 'Automata, Formal Grammars, Turing Machines & Decidability Limits',
    subTopics: [
      'Finite Automata',
      'Regular Expressions',
      'Context-Free Grammars',
      'Turing Machines',
      'Decidability'
    ],
    icon: Repeat,
    colorName: 'fuchsia',
    chipBg: 'bg-fuchsia-50',
    chipText: 'text-fuchsia-700',
    chipBorder: 'border-fuchsia-200',
    badgeBg: 'bg-fuchsia-100',
    badgeText: 'text-fuchsia-800',
    cardBorder: 'border-fuchsia-100',
    cardHoverBorder: 'hover:border-fuchsia-300',
    accentGradient: 'from-fuchsia-500 to-pink-600'
  },
  {
    id: 'compiler',
    name: 'Compiler Design',
    shortName: 'Compiler',
    description: 'Lexical Analysis, LL/LR Parsing, Intermediate Representation & Codegen',
    subTopics: [
      'Lexical Analysis',
      'Parsing (LL/LR)',
      'Intermediate Code Generation',
      'Code Optimization',
      'Symbol Tables'
    ],
    icon: FileCode,
    colorName: 'lime',
    chipBg: 'bg-lime-50',
    chipText: 'text-lime-800',
    chipBorder: 'border-lime-200',
    badgeBg: 'bg-lime-100',
    badgeText: 'text-lime-900',
    cardBorder: 'border-lime-100',
    cardHoverBorder: 'hover:border-lime-300',
    accentGradient: 'from-lime-600 to-emerald-600'
  },
  {
    id: 'se',
    name: 'Software Engineering',
    shortName: 'Software Eng',
    description: 'Agile Workflows, Testing Strategies, Clean Architecture & Requirements',
    subTopics: [
      'Agile & Scrum',
      'SDLC Models',
      'Software Testing',
      'Design Principles (SOLID)',
      'Requirement Engineering'
    ],
    icon: GitPullRequest,
    colorName: 'teal',
    chipBg: 'bg-teal-50',
    chipText: 'text-teal-700',
    chipBorder: 'border-teal-200',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    cardBorder: 'border-teal-100',
    cardHoverBorder: 'hover:border-teal-300',
    accentGradient: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'discrete-math',
    name: 'Discrete Mathematics',
    shortName: 'Discrete Math',
    description: 'Graph Theory, Propositional Logic, Combinatorics & Recurrences',
    subTopics: [
      'Graph Theory',
      'Propositional Logic',
      'Combinatorics',
      'Set Theory & Relations',
      'Recurrence Relations'
    ],
    icon: Pi,
    colorName: 'blue',
    chipBg: 'bg-blue-50',
    chipText: 'text-blue-700',
    chipBorder: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    cardBorder: 'border-blue-100',
    cardHoverBorder: 'hover:border-blue-300',
    accentGradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'aiml',
    name: 'Artificial Intelligence & Machine Learning',
    shortName: 'AI & ML',
    description: 'Heuristic Search, Neural Networks, Decision Trees & Model Evaluation',
    subTopics: [
      'Search Algorithms',
      'Decision Trees',
      'Neural Networks',
      'Entropy & Information Gain',
      'Evaluation Metrics'
    ],
    icon: Brain,
    colorName: 'purple',
    chipBg: 'bg-purple-50',
    chipText: 'text-purple-700',
    chipBorder: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    cardBorder: 'border-purple-100',
    cardHoverBorder: 'hover:border-purple-300',
    accentGradient: 'from-purple-500 to-indigo-600'
  }
];

export const CSE_SUBJECT_NAMES = CSE_SUBJECTS.map(s => s.name);

export function getSubjectConfig(subjectName: string): CseSubject {
  const norm = (subjectName || '').toLowerCase().trim();
  const found = CSE_SUBJECTS.find(s => 
    s.name.toLowerCase() === norm ||
    s.shortName.toLowerCase() === norm ||
    norm.includes(s.shortName.toLowerCase()) ||
    norm.includes(s.id)
  );

  return found || CSE_SUBJECTS[0];
}

export function getSubjectSubTopics(subjectName: string): string[] {
  const cfg = getSubjectConfig(subjectName);
  return cfg.subTopics || [];
}
