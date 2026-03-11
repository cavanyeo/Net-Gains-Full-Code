import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPageProps {
  day: number;
  attempt: number;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the first step in creating a budget?",
    options: [
      "Start cutting expenses immediately",
      "Track all sources of income",
      "Buy a budgeting app",
      "Open a savings account",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which of the following is considered 'active income'?",
    options: [
      "Stock dividends",
      "Rental property income",
      "Salary from a part-time job",
      "Interest from savings account",
    ],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "What does the 50/30/20 budgeting rule suggest?",
    options: [
      "50% savings, 30% needs, 20% wants",
      "50% needs, 30% wants, 20% savings",
      "50% wants, 30% savings, 20% needs",
      "50% needs, 30% savings, 20% wants",
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    question: "Why is it important to track irregular income (like birthday money)?",
    options: [
      "It's not important - only regular income matters",
      "To get a complete picture of your finances",
      "Because it's usually tax-free",
      "To impress your friends",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "What is 'gross income'?",
    options: [
      "Income after taxes and deductions",
      "Income from a second job only",
      "Total income before any deductions",
      "Money you keep in your wallet",
    ],
    correctAnswer: 2,
  },
  {
    id: 6,
    question: "Which category would 'allowance from parents' fall under?",
    options: [
      "Passive income",
      "Active income",
      "Regular income",
      "Investment income",
    ],
    correctAnswer: 2,
  },
  {
    id: 7,
    question: "How often should you review and update your budget?",
    options: [
      "Once a year",
      "Every 5 years",
      "Regularly (weekly or monthly)",
      "Only when you get a raise",
    ],
    correctAnswer: 2,
  },
  {
    id: 8,
    question: "What's the benefit of categorizing your income sources?",
    options: [
      "It makes your spreadsheet look prettier",
      "It helps you understand income patterns and plan better",
      "Banks require it for account opening",
      "It's legally required for teenagers",
    ],
    correctAnswer: 1,
  },
  {
    id: 9,
    question: "Which is an example of documenting income properly?",
    options: [
      "Remembering roughly how much you earned",
      "Writing down amount, date, and source",
      "Only tracking amounts over $100",
      "Counting cash in your wallet weekly",
    ],
    correctAnswer: 1,
  },
  {
    id: 10,
    question: "Why should you track small income amounts (like $5)?",
    options: [
      "You shouldn't - it's a waste of time",
      "Small amounts add up over time",
      "Only if it's from a job",
      "To complicate your budget",
    ],
    correctAnswer: 1,
  },
];

export function QuizPage({ day, attempt, onComplete, onBack }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    (number | null)[]
  >(Array(quizQuestions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Timer effect
  useState(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / quizQuestions.length) * 100);
    const passed = scorePercentage >= 80;

    onComplete(scorePercentage, passed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const answeredCount = selectedAnswers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === quizQuestions.length;

  return (
    <div
      className="min-h-screen pb-24 px-5 pt-6"
      style={{ backgroundColor: "#F1F7F6" }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #AACBC4",
              boxShadow: "0 2px 8px rgba(2,27,26,0.06)",
            }}
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} color="#021B1A" />
          </motion.button>
          <div>
            <h1
              style={{
                color: "#021B1A",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Day {day} Quiz
            </h1>
            <p
              style={{
                color: "#707D7D",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Attempt {attempt + 1} • 10 Questions
            </p>
          </div>
        </div>

        {/* Timer */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            backgroundColor:
              timeLeft < 60
                ? "rgba(212,24,61,0.1)"
                : "rgba(44,194,149,0.1)",
            border:
              timeLeft < 60 ? "2px solid #d4183d" : "2px solid #2CC295",
          }}
        >
          <Clock
            size={16}
            color={timeLeft < 60 ? "#d4183d" : "#2CC295"}
          />
          <span
            style={{
              color: timeLeft < 60 ? "#d4183d" : "#2CC295",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              color: "#021B1A",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <span
            style={{
              color: "#2CC295",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {answeredCount}/{quizQuestions.length} answered
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(170,203,196,0.3)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #2CC295 0%, #00DF81 100%)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="rounded-3xl p-6 mb-6"
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #AACBC4",
            boxShadow: "0 8px 24px rgba(2,27,26,0.08)",
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question Number Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(44,194,149,0.1)",
              border: "1px solid #2CC295",
            }}
          >
            <span
              style={{
                color: "#2CC295",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              QUESTION {currentQuestion + 1}
            </span>
          </div>

          {/* Question Text */}
          <h2
            className="mb-6"
            style={{
              color: "#021B1A",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {quizQuestions[currentQuestion].question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {quizQuestions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              return (
                <motion.button
                  key={index}
                  className="w-full p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(44,194,149,0.1)"
                      : "#F1F7F6",
                    border: isSelected
                      ? "2px solid #2CC295"
                      : "2px solid transparent",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(44,194,149,0.15)"
                      : "none",
                  }}
                  onClick={() => handleAnswerSelect(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isSelected
                          ? "#2CC295"
                          : "#ffffff",
                        border: isSelected
                          ? "none"
                          : "2px solid #AACBC4",
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "#F1F7F6" }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        color: isSelected ? "#021B1A" : "#707D7D",
                        fontSize: 15,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {option}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mb-4">
        <motion.button
          className="flex-1 py-3.5 rounded-xl"
          style={{
            backgroundColor: currentQuestion > 0 ? "#ffffff" : "#F1F7F6",
            border: "2px solid #AACBC4",
            opacity: currentQuestion > 0 ? 1 : 0.5,
            pointerEvents: currentQuestion > 0 ? "auto" : "none",
          }}
          onClick={handlePrevious}
          whileHover={currentQuestion > 0 ? { scale: 1.02 } : {}}
          whileTap={currentQuestion > 0 ? { scale: 0.98 } : {}}
        >
          <span
            style={{
              color: "#021B1A",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Previous
          </span>
        </motion.button>

        {currentQuestion < quizQuestions.length - 1 ? (
          <motion.button
            className="flex-1 py-3.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)",
              boxShadow: "0 4px 16px rgba(44,194,149,0.3)",
            }}
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Next
            </span>
          </motion.button>
        ) : (
          <motion.button
            className="flex-1 py-3.5 rounded-xl"
            style={{
              background: allAnswered
                ? "linear-gradient(135deg, #2CC295 0%, #00DF81 100%)"
                : "#AACBC4",
              boxShadow: allAnswered
                ? "0 4px 16px rgba(44,194,149,0.3)"
                : "none",
              opacity: allAnswered ? 1 : 0.6,
            }}
            onClick={handleSubmit}
            whileHover={allAnswered ? { scale: 1.02 } : {}}
            whileTap={allAnswered ? { scale: 0.98 } : {}}
          >
            <span
              style={{
                color: "#F1F7F6",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Submit Quiz
            </span>
          </motion.button>
        )}
      </div>

      {/* Question Grid Navigator */}
      <motion.div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "#ffffff",
          border: "2px solid #AACBC4",
          boxShadow: "0 4px 12px rgba(2,27,26,0.06)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p
          className="mb-3"
          style={{
            color: "#021B1A",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Quick Navigation
        </p>
        <div className="grid grid-cols-5 gap-2">
          {quizQuestions.map((_, index) => {
            const isAnswered = selectedAnswers[index] !== null;
            const isCurrent = currentQuestion === index;
            return (
              <motion.button
                key={index}
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: isCurrent
                    ? "#2CC295"
                    : isAnswered
                    ? "rgba(44,194,149,0.2)"
                    : "#F1F7F6",
                  border: isCurrent
                    ? "2px solid #2CC295"
                    : isAnswered
                    ? "2px solid #2CC295"
                    : "2px solid #AACBC4",
                }}
                onClick={() => setCurrentQuestion(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  style={{
                    color: isCurrent ? "#F1F7F6" : "#021B1A",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
