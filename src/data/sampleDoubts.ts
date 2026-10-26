import { Doubt, Answer } from '../types/index.ts';

export const INITIAL_SAMPLE_DOUBTS: Doubt[] = [
  {
    id: 'sample-cse-1',
    userId: 'student_seed_01',
    questionText: 'Why is Quicksort worst-case O(n^2) even if we use randomized pivot selection, and how does median-of-three or dual-pivot partitioning mitigate adversary inputs in practice?',
    subject: 'Data Structures & Algorithms',
    subTopic: 'Sorting & Searching',
    predictedTopic: 'Data Structures & Algorithms',
    topicConfidence: 0.98,
    isAnonymous: true,
    authorAlias: 'Curious Panda 42',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    answersCount: 1
  },
  {
    id: 'sample-cse-2',
    userId: 'student_seed_02',
    questionText: 'Why does decomposing a relation into Boyce-Codd Normal Form (BCNF) sometimes lose functional dependency preservation, while 3NF always guarantees dependency preservation? Can you share a simple concrete schema example with functional dependencies?',
    subject: 'Database Management Systems (DBMS)',
    subTopic: 'Normalization',
    predictedTopic: 'Database Management Systems (DBMS)',
    topicConfidence: 0.99,
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    isAnonymous: true,
    authorAlias: 'Witty Otter 19',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-3',
    userId: 'student_seed_03',
    questionText: 'How does the Clock page replacement algorithm approximate Least Recently Used (LRU) using second-chance reference bits, and why is pure LRU too expensive to implement directly in the hardware MMU?',
    subject: 'Operating Systems',
    subTopic: 'Paging',
    predictedTopic: 'Operating Systems',
    topicConfidence: 0.96,
    isAnonymous: true,
    authorAlias: 'Clever Falcon 88',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-4',
    userId: 'student_seed_04',
    questionText: 'In TCP congestion control, why does TCP Reno cut the congestion window in half upon triple duplicate ACKs (Fast Retransmit) but reset cwnd down to 1 MSS upon a retransmission timeout (RTO)?',
    subject: 'Computer Networks',
    subTopic: 'Transport Layer',
    predictedTopic: 'Computer Networks',
    topicConfidence: 0.97,
    isAnonymous: true,
    authorAlias: 'Brave Lynx 31',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-5',
    userId: 'student_seed_05',
    questionText: 'How do 2-bit saturating branch predictors prevent thrashing in nested loops, and how does pipeline branch target buffering (BTB) differ from static branch prediction?',
    subject: 'Computer Organization & Architecture',
    subTopic: 'Pipelining',
    predictedTopic: 'Computer Organization & Architecture',
    topicConfidence: 0.95,
    isAnonymous: true,
    authorAlias: 'Inquisitive Owl 14',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-6',
    userId: 'student_seed_06',
    questionText: 'How does dynamic polymorphism use the vtable and vptr under the hood in C++? If a derived class overrides 2 virtual methods and introduces 1 new virtual method, what does the memory layout look like?',
    subject: 'Object-Oriented Programming',
    subTopic: 'Inheritance & Polymorphism',
    predictedTopic: 'Object-Oriented Programming',
    topicConfidence: 0.94,
    isAnonymous: true,
    authorAlias: 'Swift Badger 73',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-7',
    userId: 'student_seed_07',
    questionText: 'How do we formally use the Pumping Lemma to prove that the language L = {0^n 1^n | n >= 0} is not regular? Why can we choose the string s = 0^p 1^p, but the adversary chooses the decomposition s = xyz?',
    subject: 'Theory of Computation',
    subTopic: 'Finite Automata',
    predictedTopic: 'Theory of Computation',
    topicConfidence: 0.98,
    isAnonymous: true,
    authorAlias: 'Agile Cheetah 64',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'answered',
    hasVerifiedAnswer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    answersCount: 1
  },
  {
    id: 'sample-cse-8',
    userId: 'student_seed_08',
    questionText: 'What causes a shift-reduce conflict in an LR(0) or SLR(1) parser for the classic dangling-else ambiguity in if-else statements, and how do parser generators like Yacc/Bison resolve it by favoring shift?',
    subject: 'Compiler Design',
    subTopic: 'Parsing (LL/LR)',
    predictedTopic: 'Compiler Design',
    topicConfidence: 0.93,
    isAnonymous: true,
    authorAlias: 'Keen Beaver 55',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'open',
    hasVerifiedAnswer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago (Unanswered)
    answersCount: 0
  },
  {
    id: 'sample-cse-9',
    userId: 'student_seed_09',
    questionText: 'When refactoring a monolithic God Object class into decoupled microservices, how do we enforce the Single Responsibility Principle without introducing excessive network hops and distributed transaction overhead?',
    subject: 'Software Engineering',
    subTopic: 'Design Principles (SOLID)',
    predictedTopic: 'Software Engineering',
    topicConfidence: 0.91,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    isAnonymous: true,
    authorAlias: 'Vigilant Hawk 91',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'needs teacher review',
    hasVerifiedAnswer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1.25 hours ago (Needs Teacher Review)
    answersCount: 0
  },
  {
    id: 'sample-cse-10',
    userId: 'student_seed_10',
    questionText: 'Why does the Master Theorem have a gap where it cannot be applied to recurrences like T(n) = 2T(n/2) + n/log(n)? How do we solve this recurrence rigorously using recursion tree or Akra-Bazzi method?',
    subject: 'Discrete Mathematics',
    subTopic: 'Recurrence Relations',
    predictedTopic: 'Discrete Mathematics',
    topicConfidence: 0.92,
    isAnonymous: true,
    authorAlias: 'Zenith Wolf 12',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'open',
    hasVerifiedAnswer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(), // Unanswered
    answersCount: 0
  },
  {
    id: 'sample-cse-11',
    userId: 'student_seed_11',
    questionText: 'Why does backpropagation in deep neural networks suffer from vanishing gradients when using Sigmoid activation functions, and how does He (Kaiming) normal initialization with ReLU mathematically prevent gradient decay?',
    subject: 'Artificial Intelligence & Machine Learning',
    subTopic: 'Neural Networks',
    predictedTopic: 'Artificial Intelligence & Machine Learning',
    topicConfidence: 0.95,
    isAnonymous: true,
    authorAlias: 'Bright Dolphin 37',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'needs teacher review',
    hasVerifiedAnswer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // Needs Teacher Review
    answersCount: 0
  },
  {
    id: 'sample-cse-12',
    userId: 'student_seed_12',
    questionText: 'How does the Disjoint Set Union (DSU) data structure achieve nearly O(1) amortized operations with path compression and union by rank? What is the intuition behind the inverse Ackermann function α(n) proof?',
    subject: 'Data Structures & Algorithms',
    subTopic: 'Complexity Analysis',
    predictedTopic: 'Data Structures & Algorithms',
    topicConfidence: 0.96,
    isAnonymous: true,
    authorAlias: 'Orbiting Fox 66',
    authorName: undefined,
    authorEmail: 'student@college.edu',
    status: 'open',
    hasVerifiedAnswer: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago (Unanswered)
    answersCount: 0
  }
];

export const INITIAL_SAMPLE_ANSWERS: Answer[] = [
  {
    id: 'sample-cse-ans-1',
    doubtId: 'sample-cse-1',
    userId: 'teacher_seed_01',
    authorName: 'Prof. Alok Mukherjee (Faculty)',
    answerText: `Great question! In randomized Quicksort, worst-case $O(n^2)$ occurs when by extreme bad luck the random pivot selector consistently chooses an extreme element (smallest or largest) at every partition step, yielding unbalanced recursion trees of depths $n, n-1, \\dots, 1$.

### Why Worst-Case is Still $O(n^2)$
Even though the expected running time is $O(n \\log n)$ with probability $1 - 2^{-\\Omega(n)}$, the sample space still contains permutations where the random choices pick the minimum or maximum element at every level. The recurrence becomes:
$$T(n) = T(n-1) + T(0) + \\Theta(n) = O(n^2)$$

### Practical Mitigations
1. **Median-of-Three Partitioning:**
   Inspects the first, middle, and last elements ($A[low], A[mid], A[high]$) and picks the median value as pivot. This foils sorted or reverse-sorted inputs.
2. **Dual-Pivot Partitioning (Yaroslavskiy's Algorithm, used in Java's Arrays.sort):**
   Splits the array into three segments using two pivots $P_1 < P_2$:
   - Elements $< P_1$
   - Elements between $P_1$ and $P_2$
   - Elements $> P_2$
   It significantly reduces cache misses and comparison overhead on modern CPU architectures.
3. **Introsort (C++ std::sort):**
   Begins with Quicksort, but monitors recursion depth. If depth exceeds $2 \\lfloor \\log_2 n \\rfloor$, it switches to **Heapsort**, guaranteeing $O(n \\log n)$ worst-case safety.`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'sample-cse-ans-2',
    doubtId: 'sample-cse-2',
    userId: 'teacher_seed_02',
    authorName: 'Dr. Catherine Vance (Faculty)',
    answerText: `Excellent database theory doubt! Here is the precise distinction between 3NF and BCNF.

### The Definitions
- **3NF Definition:** For every non-trivial functional dependency $X \\to A$, either $X$ is a superkey OR $A$ is a prime attribute (part of any candidate key).
- **BCNF Definition:** For every non-trivial functional dependency $X \\to A$, $X$ MUST be a superkey.

### Classic Concrete Schema Example
Consider relation $R(\\text{Student}, \\text{Course}, \\text{Professor})$ with FDs:
1. $\\{\\text{Student}, \\text{Course}\\} \\to \\text{Professor}$ (A student takes a course taught by one professor)
2. $\\text{Professor} \\to \\text{Course}$ (Each professor teaches only one course)

- **Candidate Keys:** $\\{\\text{Student}, \\text{Course}\\}$ and $\\{\\text{Student}, \\text{Professor}\\}$
- **Prime Attributes:** $\\text{Student}, \\text{Course}, \\text{Professor}$ (all are prime!)

#### 3NF Check:
- $\\{\\text{Student}, \\text{Course}\\} \\to \\text{Professor}$: LHS is a superkey (Passes 3NF & BCNF).
- $\\text{Professor} \\to \\text{Course}$: $\\text{Professor}$ is NOT a superkey, BUT $\\text{Course}$ is a prime attribute. **Therefore, $R$ is in 3NF!**

#### BCNF Decomposition:
Because $\\text{Professor} \\to \\text{Course}$ violates BCNF, we decompose into:
- $R_1(\\underline{\\text{Professor}}, \\text{Course})$ with $\\text{Professor} \\to \\text{Course}$
- $R_2(\\underline{\\text{Student}, \\text{Professor}})$ with no non-trivial FDs

Notice: The dependency $\\{\\text{Student}, \\text{Course}\\} \\to \\text{Professor}$ spans across $R_1$ and $R_2$ and CANNOT be verified without joining them! We lost **dependency preservation**.

**Summary Rule:** 3NF always guarantees both lossless join and dependency preservation. BCNF guarantees lossless join and zero redundancy, but may sacrifice dependency preservation.`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'sample-cse-ans-3',
    doubtId: 'sample-cse-3',
    userId: 'teacher_seed_01',
    authorName: 'Prof. Alok Mukherjee (Faculty)',
    answerText: `Here is the architectural rationale:

### Why Pure LRU is Too Expensive in Hardware
To implement pure Least Recently Used (LRU) in hardware:
1. **Counter / Timestamp Approach:** Every memory reference must update a clock register in the page table entry. Comparing 64-bit timestamps across millions of frames on every page fault creates massive bus contention.
2. **Stack / Doubly Linked List Approach:** Moving a referenced page node to the top of the stack on *every single memory access* requires updating 6 pointers in hardware. At CPU clock speeds (3 GHz), this would throttle memory throughput by 80%.

### How the Clock Algorithm (Second Chance) Works
The Clock algorithm uses a single **reference bit** ($R$) maintained by the hardware MMU:
1. When a page is read or written, the hardware MMU sets $R = 1$ (virtually zero overhead).
2. The OS maintains a circular buffer of page frames with a pointer (the "clock hand").
3. When a page fault requires an eviction:
   - If the frame at the clock hand has $R == 1$, the OS clears it ($R \\leftarrow 0$) and advances the hand to the next frame (giving it a "second chance").
   - If the frame has $R == 0$, this page has not been referenced since the hand last visited it: it is **evicted** immediately, and the hand advances.

This achieves near-LRU hit rates with $O(1)$ amortized eviction overhead!`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: 'sample-cse-ans-4',
    doubtId: 'sample-cse-4',
    userId: 'teacher_seed_03',
    authorName: 'Dr. Marcus Reynolds (Faculty)',
    answerText: `This distinction is fundamental to TCP's network equilibrium!

### Triple Duplicate ACKs (Fast Retransmit & Fast Recovery)
When the sender receives 3 duplicate ACKs (4 identical ACKs total for sequence number $N$):
- **Network Diagnosis:** Three subsequent packets ($N+1, N+2, N+3$) arrived at the receiver and triggered ACKs. Packets are still moving through the network!
- The network is not collapsed; only a single segment was lost or dropped due to mild buffer overflow.
- **Action (Fast Recovery):**
  - $\\text{ssthresh} = \\frac{\\text{cwnd}}{2}$
  - $\\text{cwnd} = \\text{ssthresh} + 3 \\times \\text{MSS}$
  - Avoids dropping back to Slow Start, keeping the data pipe full.

### Retransmission Timeout (RTO)
When a timeout timer expires before an ACK arrives:
- **Network Diagnosis:** Severe congestion! Neither data packets nor ACKs are getting through (catastrophic queue drop at routers).
- Injecting more packets would cause congestion collapse.
- **Action:**
  - $\\text{ssthresh} = \\frac{\\text{cwnd}}{2}$
  - $\\text{cwnd} = 1 \\times \\text{MSS}$ (Full reset to Slow Start)
  - Timer backoff: Double the RTO value (exponential backoff) to give the network queues breathing room to drain.`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
  },
  {
    id: 'sample-cse-ans-5',
    doubtId: 'sample-cse-5',
    userId: 'teacher_seed_03',
    authorName: 'Dr. Marcus Reynolds (Faculty)',
    answerText: `### 1-Bit vs 2-Bit Saturating Predictors
With a 1-bit predictor, a loop that executes 100 times mispredicts twice:
1. On the last loop exit (predicts Taken, but exits).
2. On the next loop re-entry (predicts Not Taken based on exit, but takes the loop).

A **2-bit saturating counter** has 4 states:
- 00: Strongly Not Taken
- 01: Weakly Not Taken
- 10: Weakly Taken
- 11: Strongly Taken

In a loop, the state stays at **11 (Strongly Taken)**. On the exit branch, it drops to **10 (Weakly Taken)**. When the loop restarts, it still predicts **Taken**! Thus, it mispredicts only ONCE instead of twice.

### Static vs Dynamic BTB
- **Static Prediction:** Fixed rule at compile time (e.g., "backward branches taken, forward branches not taken").
- **Branch Target Buffer (BTB):** A high-speed cache indexed by the branch instruction's Program Counter (PC). It caches both the prediction state (2-bit counter) AND the target address, allowing the fetch unit to speculatively fetch from target without waiting for decode!`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
  },
  {
    id: 'sample-cse-ans-6',
    doubtId: 'sample-cse-6',
    userId: 'teacher_seed_02',
    authorName: 'Dr. Catherine Vance (Faculty)',
    answerText: `Here is the exact runtime memory layout for dynamic dispatch in C++:

### Object Memory Layout
When a class declares or inherits at least one virtual method, the compiler injects a hidden pointer named \`vptr\` into the object's memory:

\`\`\`
[ Object Instance in Heap/Stack ]
+------------------------------------+
| vptr (8 bytes on 64-bit CPU)       | ----> points to Class VTable
+------------------------------------+
| Member variable 1 (e.g., int id)   |
+------------------------------------+
| Member variable 2 (e.g., double x) |
+------------------------------------+
\`\`\`

### VTable (Virtual Method Table)
The vtable is a static array of function pointers stored in the read-only data segment (\`.rodata\`):

\`\`\`cpp
class Base {
public:
    virtual void f(); // slot 0
    virtual void g(); // slot 1
};

class Derived : public Base {
public:
    void f() override; // slot 0: points to Derived::f()
    // g() inherited   // slot 1: points to Base::g()
    virtual void h();  // slot 2: points to Derived::h()
};
\`\`\`

### Invocation Mechanism
When calling \`ptr->f()\`:
1. Dereference \`ptr\` to load \`vptr\`.
2. Offset into vtable array at index 0: \`vptr[0]\`.
3. Jump to function address: \`call *vptr[0]\`.
This indirection takes only 2 clock cycles with L1 cache hits!`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  },
  {
    id: 'sample-cse-ans-7',
    doubtId: 'sample-cse-7',
    userId: 'teacher_seed_01',
    authorName: 'Prof. Alok Mukherjee (Faculty)',
    answerText: `A common exam pitfall! The Pumping Lemma is an adversarial game:

### The Adversarial Game Rules:
1. **Adversary:** Claims $L$ is regular with some pumping length $p \\ge 1$.
2. **You:** Choose a specific string $s \\in L$ such that $|s| \\ge p$. (You choose $s$, but in terms of the adversary's unknown $p$).
3. **Adversary:** Splits your $s$ into $xyz$ satisfying:
   - $|y| > 0$
   - $|xy| \\le p$
4. **You:** Must show that for *any* decomposition the adversary could have chosen, there exists an integer $i \\ge 0$ such that $x y^i z \\notin L$.

### The Proof for $L = \\{0^n 1^n \\mid n \\ge 0\\}$:
1. Let $p$ be the pumping length.
2. Choose $s = 0^p 1^p$. Clearly $s \\in L$ and $|s| = 2p \\ge p$.
3. Since $|xy| \\le p$, both $x$ and $y$ must consist solely of $0$'s!
   - That is, $y = 0^k$ where $1 \\le k \\le p$.
4. Now pump down with $i = 0$:
   - $x y^0 z = x z = 0^{p-k} 1^p$.
   - The number of $0$'s is $p-k < p$, while the number of $1$'s is still $p$.
   - $0^{p-k} 1^p \\notin L$!
Contradiction. Therefore $L$ is not regular. Q.E.D.`,
    source: 'teacher',
    isVerified: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString()
  }
];
