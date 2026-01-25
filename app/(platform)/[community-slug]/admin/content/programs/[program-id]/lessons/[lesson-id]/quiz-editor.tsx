"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  HelpCircle,
  Settings,
} from "lucide-react";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { BUCKETS } from "@/lib/supabase/storage-constants";
import type { Quiz, QuizQuestion, QuizOption, QuestionType } from "@/types/database";

interface QuizEditorProps {
  lessonId: string;
  programId: string;
  communitySlug: string;
  communityId: string;
  quiz: (Quiz & { quiz_questions: (QuizQuestion & { quiz_options: QuizOption[] })[] }) | null;
}

export function QuizEditor({ lessonId, programId, communitySlug, communityId, quiz }: QuizEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<(QuizQuestion & { quiz_options: QuizOption[] }) | null>(null);

  // Quiz settings form
  const [quizForm, setQuizForm] = useState({
    title: quiz?.title || "Lesson Quiz",
    description: quiz?.description || "",
    passing_score: quiz?.passing_score ?? 70,
    max_attempts: quiz?.max_attempts ?? null,
    randomize_questions: quiz?.randomize_questions ?? false,
    show_correct_answers: quiz?.show_correct_answers ?? true,
  });

  // Question form
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_type: "multiple_choice" as QuestionType,
    points: 1,
    explanation: "",
    image_url: null as string | null,
    options: [
      { option_text: "", is_correct: true, image_url: null as string | null },
      { option_text: "", is_correct: false, image_url: null as string | null },
      { option_text: "", is_correct: false, image_url: null as string | null },
      { option_text: "", is_correct: false, image_url: null as string | null },
    ],
  });

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      explanation: "",
      image_url: null,
      options: [
        { option_text: "", is_correct: true, image_url: null },
        { option_text: "", is_correct: false, image_url: null },
        { option_text: "", is_correct: false, image_url: null },
        { option_text: "", is_correct: false, image_url: null },
      ],
    });
    setEditingQuestion(null);
  };

  const handleCreateQuiz = () => {
    startTransition(async () => {
      const result = await createQuiz(lessonId, programId, communitySlug, quizForm);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create quiz. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Quiz created",
        description: "You can now add questions to your quiz.",
      });

      setCreateDialogOpen(false);
      router.refresh();
    });
  };

  const handleUpdateQuiz = () => {
    if (!quiz) return;

    startTransition(async () => {
      const result = await updateQuiz(quiz.id, lessonId, programId, communitySlug, quizForm);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update quiz settings.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Settings saved",
      });

      setSettingsOpen(false);
      router.refresh();
    });
  };

  const handleDeleteQuiz = () => {
    if (!quiz) return;
    if (!confirm("Are you sure you want to delete this quiz? All questions will be lost.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteQuiz(quiz.id, lessonId, programId, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete quiz.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Quiz deleted",
      });

      router.refresh();
    });
  };

  const handleSaveQuestion = () => {
    if (!quiz) return;

    // Validate
    if (!questionForm.question_text.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Question text is required.",
      });
      return;
    }

    const validOptions = questionForm.options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least 2 options are required.",
      });
      return;
    }

    const hasCorrect = validOptions.some((o) => o.is_correct);
    if (!hasCorrect) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one option must be marked as correct.",
      });
      return;
    }

    startTransition(async () => {
      const questionData = {
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        points: questionForm.points,
        explanation: questionForm.explanation || undefined,
        image_url: questionForm.image_url,
        options: validOptions.map((o) => ({
          option_text: o.option_text,
          is_correct: o.is_correct,
          image_url: o.image_url,
        })),
      };

      if (editingQuestion) {
        const result = await updateQuizQuestion(
          editingQuestion.id,
          lessonId,
          programId,
          communitySlug,
          questionData
        );

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update question.",
          });
          return;
        }

        toast({
          variant: "success",
          title: "Question updated",
        });
      } else {
        const result = await createQuizQuestion(
          quiz.id,
          lessonId,
          programId,
          communitySlug,
          questionData
        );

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create question.",
          });
          return;
        }

        toast({
          variant: "success",
          title: "Question added",
        });
      }

      setQuestionDialogOpen(false);
      resetQuestionForm();
      router.refresh();
    });
  };

  const handleEditQuestion = (question: QuizQuestion & { quiz_options: QuizOption[] }) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_text: question.question_text,
      question_type: question.question_type as QuestionType,
      points: question.points,
      explanation: question.explanation || "",
      image_url: question.image_url,
      options: question.quiz_options.length > 0
        ? question.quiz_options.map((o) => ({
            option_text: o.option_text,
            is_correct: o.is_correct,
            image_url: o.image_url,
          }))
        : [
            { option_text: "", is_correct: true, image_url: null },
            { option_text: "", is_correct: false, image_url: null },
          ],
    });
    setQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    startTransition(async () => {
      const result = await deleteQuizQuestion(questionId, lessonId, programId, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete question.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Question deleted",
      });

      router.refresh();
    });
  };

  const toggleOptionCorrect = (index: number) => {
    const newOptions = [...questionForm.options];
    if (questionForm.question_type === "multiple_choice" || questionForm.question_type === "true_false") {
      // Only one correct answer
      newOptions.forEach((o, i) => {
        o.is_correct = i === index;
      });
    } else {
      // Multi-select: toggle
      newOptions[index].is_correct = !newOptions[index].is_correct;
    }
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    if (questionForm.options.length >= 6) return;
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { option_text: "", is_correct: false, image_url: null }],
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) return;
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  // No quiz yet - show create button
  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>
            Add a quiz to test learners on this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Quiz</DialogTitle>
                <DialogDescription>
                  Configure your quiz settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Title</Label>
                  <Input
                    id="quiz-title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="Lesson Quiz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-desc">Description (optional)</Label>
                  <Textarea
                    id="quiz-desc"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    placeholder="Test your understanding of this lesson..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <Input
                      id="passing-score"
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.passing_score}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      min={1}
                      value={quizForm.max_attempts || ""}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          max_attempts: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="randomize">Randomize Questions</Label>
                  <Switch
                    id="randomize"
                    checked={quizForm.randomize_questions}
                    onCheckedChange={(checked) =>
                      setQuizForm({ ...quizForm, randomize_questions: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-answers">Show Correct Answers</Label>
                  <Switch
                    id="show-answers"
                    checked={quizForm.show_correct_answers}
                    onCheckedChange={(checked) =>
                      setQuizForm({ ...quizForm, show_correct_answers: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQuiz} disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Quiz
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // Quiz exists - show editor
  const questions = quiz.quiz_questions || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              {questions.length} {questions.length === 1 ? "question" : "questions"} &bull; {quiz.passing_score}% to pass
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quiz Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-title">Title</Label>
                    <Input
                      id="edit-quiz-title"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-desc">Description</Label>
                    <Textarea
                      id="edit-quiz-desc"
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Passing Score (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={quizForm.passing_score}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Attempts</Label>
                      <Input
                        type="number"
                        min={1}
                        value={quizForm.max_attempts || ""}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            max_attempts: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Randomize Questions</Label>
                    <Switch
                      checked={quizForm.randomize_questions}
                      onCheckedChange={(checked) =>
                        setQuizForm({ ...quizForm, randomize_questions: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Correct Answers</Label>
                    <Switch
                      checked={quizForm.show_correct_answers}
                      onCheckedChange={(checked) =>
                        setQuizForm({ ...quizForm, show_correct_answers: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="flex justify-between">
                  <Button variant="destructive" onClick={handleDeleteQuiz} disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Quiz
                  </Button>
                  <Button onClick={handleUpdateQuiz} disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Settings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              open={questionDialogOpen}
              onOpenChange={(open) => {
                setQuestionDialogOpen(open);
                if (!open) resetQuestionForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? "Edit Question" : "Add Question"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="q-text">Question</Label>
                    <Textarea
                      id="q-text"
                      value={questionForm.question_text}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, question_text: e.target.value })
                      }
                      placeholder="Enter your question..."
                      rows={2}
                    />
                  </div>

                  {/* Question Image */}
                  <ImageUpload
                    label="Question Image (optional)"
                    description="Add an image or GIF to accompany the question"
                    value={questionForm.image_url}
                    onChange={(url) => setQuestionForm({ ...questionForm, image_url: url })}
                    bucket={BUCKETS.LESSON_CONTENT}
                    communityId={communityId}
                    aspectRatio="video"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={questionForm.question_type}
                        onValueChange={(value: QuestionType) =>
                          setQuestionForm({ ...questionForm, question_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True / False</SelectItem>
                          <SelectItem value="multi_select">Multi-Select</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={1}
                        value={questionForm.points}
                        onChange={(e) =>
                          setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options</Label>
                      {questionForm.options.length < 6 && (
                        <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleOptionCorrect(index)}
                              className="flex-shrink-0"
                            >
                              {option.is_correct ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            <Input
                              value={option.option_text}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[index].option_text = e.target.value;
                                setQuestionForm({ ...questionForm, options: newOptions });
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {questionForm.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {/* Option Image */}
                          {option.image_url ? (
                            <div className="relative ml-7">
                              <img
                                src={option.image_url}
                                alt={`Option ${index + 1}`}
                                className="h-16 rounded border object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => {
                                  const newOptions = [...questionForm.options];
                                  newOptions[index].image_url = null;
                                  setQuestionForm({ ...questionForm, options: newOptions });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="ml-7">
                              <ImageUpload
                                value={null}
                                onChange={(url) => {
                                  const newOptions = [...questionForm.options];
                                  newOptions[index].image_url = url;
                                  setQuestionForm({ ...questionForm, options: newOptions });
                                }}
                                bucket={BUCKETS.LESSON_CONTENT}
                                communityId={communityId}
                                aspectRatio="video"
                                className="max-w-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the circle to mark correct answer(s). You can optionally add images to each option.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="q-explanation">Explanation (optional)</Label>
                    <Textarea
                      id="q-explanation"
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, explanation: e.target.value })
                      }
                      placeholder="Explain why this answer is correct..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuestionDialogOpen(false);
                      resetQuestionForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveQuestion} disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {questions.map((question, index) => (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="flex-1 truncate">{question.question_text}</span>
                    <span className="text-xs text-muted-foreground">
                      {question.points} {question.points === 1 ? "pt" : "pts"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-3">
                    <div className="space-y-1">
                      {question.quiz_options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 p-2 rounded ${
                            option.is_correct ? "bg-green-50 dark:bg-green-950/30" : ""
                          }`}
                        >
                          {option.is_correct ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm">{option.option_text}</span>
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions yet. Add your first question to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
