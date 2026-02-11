"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  HelpCircle,
  ListOrdered,
  MessageSquare,
  Play,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ComponentToolbarProps {
  onInsert: (mdx: string) => void;
  lessonContent: string;
  lessonTitle: string;
}

export function ComponentToolbar({ onInsert, lessonContent, lessonTitle }: ComponentToolbarProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Callout state
  const [calloutType, setCalloutType] = useState<string>("info");
  const [calloutTitle, setCalloutTitle] = useState("");
  const [calloutContent, setCalloutContent] = useState("");

  // Choice/Quiz state
  const [choiceQuestion, setChoiceQuestion] = useState("");
  const [choiceOptions, setChoiceOptions] = useState([
    { text: "", correct: false, explanation: "" },
    { text: "", correct: false, explanation: "" },
    { text: "", correct: false, explanation: "" },
    { text: "", correct: false, explanation: "" },
  ]);

  // Signal Box state
  const [signalType, setSignalType] = useState<"bullish" | "bearish">("bullish");
  const [signalEntry, setSignalEntry] = useState("");
  const [signalStop, setSignalStop] = useState("");
  const [signalTarget, setSignalTarget] = useState("");
  const [signalRR, setSignalRR] = useState("");

  // Steps state
  const [steps, setSteps] = useState([
    { title: "", content: "" },
    { title: "", content: "" },
    { title: "", content: "" },
  ]);

  // Video state
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const resetForms = () => {
    setCalloutType("info");
    setCalloutTitle("");
    setCalloutContent("");
    setChoiceQuestion("");
    setChoiceOptions([
      { text: "", correct: false, explanation: "" },
      { text: "", correct: false, explanation: "" },
      { text: "", correct: false, explanation: "" },
      { text: "", correct: false, explanation: "" },
    ]);
    setSignalType("bullish");
    setSignalEntry("");
    setSignalStop("");
    setSignalTarget("");
    setSignalRR("");
    setSteps([
      { title: "", content: "" },
      { title: "", content: "" },
      { title: "", content: "" },
    ]);
    setVideoUrl("");
    setVideoTitle("");
  };

  const insertCallout = () => {
    const mdx = `<Callout type="${calloutType}"${calloutTitle ? ` title="${calloutTitle}"` : ""}>
  ${calloutContent}
</Callout>`;
    onInsert(mdx);
    setActiveModal(null);
    resetForms();
  };

  const insertChoice = () => {
    const validOptions = choiceOptions.filter(o => o.text.trim());
    const optionsStr = validOptions
      .map(o => `    { text: "${o.text}", correct: ${o.correct}, explanation: "${o.explanation}" }`)
      .join(",\n");
    
    const mdx = `<Choice
  question="${choiceQuestion}"
  options={[
${optionsStr}
  ]}
/>`;
    onInsert(mdx);
    setActiveModal(null);
    resetForms();
  };

  const insertSignalBox = () => {
    const mdx = `<SignalBox
  type="${signalType}"
  entry="${signalEntry}"
  stopLoss="${signalStop}"
  target="${signalTarget}"${signalRR ? `\n  riskReward="${signalRR}"` : ""}
/>`;
    onInsert(mdx);
    setActiveModal(null);
    resetForms();
  };

  const insertSteps = () => {
    const validSteps = steps.filter(s => s.title.trim());
    const stepsStr = validSteps
      .map((s, i) => `  <Step number={${i + 1}} title="${s.title}">\n    ${s.content}\n  </Step>`)
      .join("\n");
    
    const mdx = `<Steps>
${stepsStr}
</Steps>`;
    onInsert(mdx);
    setActiveModal(null);
    resetForms();
  };

  const insertVideo = () => {
    const mdx = `<Video src="${videoUrl}"${videoTitle ? ` title="${videoTitle}"` : ""} />`;
    onInsert(mdx);
    setActiveModal(null);
    resetForms();
  };

  const handleAIGenerate = async () => {
    if (!lessonContent || lessonContent.length < 50) {
      alert("Add more lesson content first so AI can analyze it.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonTitle, lessonContent }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const { mdx } = await response.json();
      onInsert(mdx);
      setActiveModal(null);
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Failed to generate components. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg border mb-2">
        <span className="text-xs text-muted-foreground mr-2">Insert:</span>

        {/* Callout */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setActiveModal("callout")}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Callout
            </Button>
          </TooltipTrigger>
          <TooltipContent>Info, warning, tip boxes</TooltipContent>
        </Tooltip>

        {/* Quiz/Choice */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setActiveModal("choice")}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Quiz
            </Button>
          </TooltipTrigger>
          <TooltipContent>Interactive question with feedback</TooltipContent>
        </Tooltip>

        {/* Signal Box */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setActiveModal("signal")}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Trade Setup
            </Button>
          </TooltipTrigger>
          <TooltipContent>Long/short signal box</TooltipContent>
        </Tooltip>

        {/* Steps */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setActiveModal("steps")}
            >
              <ListOrdered className="h-4 w-4 mr-1" />
              Steps
            </Button>
          </TooltipTrigger>
          <TooltipContent>Numbered step-by-step guide</TooltipContent>
        </Tooltip>

        {/* Video */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setActiveModal("video")}
            >
              <Play className="h-4 w-4 mr-1" />
              Video
            </Button>
          </TooltipTrigger>
          <TooltipContent>Embed YouTube, Vimeo, Loom</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-2" />

        {/* AI Generate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 bg-purple-600 hover:bg-purple-700"
              onClick={() => setActiveModal("ai")}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Enhance
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI generates interactive components from your content</TooltipContent>
        </Tooltip>

        {/* CALLOUT MODAL */}
        <Dialog open={activeModal === "callout"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Callout</DialogTitle>
              <DialogDescription>
                Highlight important information with a styled box
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={calloutType} onValueChange={setCalloutType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">ℹ️ Info</SelectItem>
                    <SelectItem value="tip">💡 Tip</SelectItem>
                    <SelectItem value="warning">⚠️ Warning</SelectItem>
                    <SelectItem value="danger">🚨 Danger</SelectItem>
                    <SelectItem value="success">✅ Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  value={calloutTitle}
                  onChange={(e) => setCalloutTitle(e.target.value)}
                  placeholder="e.g., Pro Tip"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={calloutContent}
                  onChange={(e) => setCalloutContent(e.target.value)}
                  placeholder="The important information..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={insertCallout} disabled={!calloutContent.trim()}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CHOICE/QUIZ MODAL */}
        <Dialog open={activeModal === "choice"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Quiz Question</DialogTitle>
              <DialogDescription>
                Create an interactive question with instant feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={choiceQuestion}
                  onChange={(e) => setChoiceQuestion(e.target.value)}
                  placeholder="What would you do in this scenario?"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <Label>Options (mark correct answer)</Label>
                {choiceOptions.map((opt, i) => (
                  <div key={i} className="space-y-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.correct}
                        onCheckedChange={(checked) => {
                          const newOpts = [...choiceOptions];
                          // For single-answer, uncheck others
                          newOpts.forEach((o, idx) => o.correct = idx === i ? checked : false);
                          setChoiceOptions(newOpts);
                        }}
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...choiceOptions];
                          newOpts[i].text = e.target.value;
                          setChoiceOptions(newOpts);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                      />
                    </div>
                    <Input
                      value={opt.explanation}
                      onChange={(e) => {
                        const newOpts = [...choiceOptions];
                        newOpts[i].explanation = e.target.value;
                        setChoiceOptions(newOpts);
                      }}
                      placeholder="Explanation when selected..."
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button 
                onClick={insertChoice} 
                disabled={!choiceQuestion.trim() || choiceOptions.filter(o => o.text.trim()).length < 2}
              >
                Insert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SIGNAL BOX MODAL */}
        <Dialog open={activeModal === "signal"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trade Setup</DialogTitle>
              <DialogDescription>
                Display a professional long or short signal box
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={signalType} onValueChange={(v: "bullish" | "bearish") => setSignalType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullish">🟢 Long (Bullish)</SelectItem>
                    <SelectItem value="bearish">🔴 Short (Bearish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Price</Label>
                  <Input
                    value={signalEntry}
                    onChange={(e) => setSignalEntry(e.target.value)}
                    placeholder="$67,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stop Loss</Label>
                  <Input
                    value={signalStop}
                    onChange={(e) => setSignalStop(e.target.value)}
                    placeholder="$66,500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input
                    value={signalTarget}
                    onChange={(e) => setSignalTarget(e.target.value)}
                    placeholder="$68,500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risk:Reward (optional)</Label>
                  <Input
                    value={signalRR}
                    onChange={(e) => setSignalRR(e.target.value)}
                    placeholder="1:3"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={insertSignalBox} disabled={!signalEntry || !signalStop || !signalTarget}>
                Insert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* STEPS MODAL */}
        <Dialog open={activeModal === "steps"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Step-by-Step Guide</DialogTitle>
              <DialogDescription>
                Create a numbered walkthrough
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[i].title = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Step title"
                    />
                    <Textarea
                      value={step.content}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[i].content = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Step description..."
                      rows={2}
                    />
                  </div>
                  {steps.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSteps([...steps, { title: "", content: "" }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={insertSteps} disabled={steps.filter(s => s.title.trim()).length < 1}>
                Insert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* VIDEO MODAL */}
        <Dialog open={activeModal === "video"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Embed Video</DialogTitle>
              <DialogDescription>
                Add a video from YouTube, Vimeo, or Loom
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label>Caption (optional)</Label>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Watch: How to set stop losses"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={insertVideo} disabled={!videoUrl.trim()}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI GENERATE MODAL */}
        <Dialog open={activeModal === "ai"} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Content Enhancer
              </DialogTitle>
              <DialogDescription>
                AI will analyze your lesson and generate interactive components
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your lesson content, AI will suggest:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Key takeaways as Callout boxes
                  </li>
                  <li className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" />
                    Quiz questions to test understanding
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Trade setups if trading content detected
                  </li>
                  <li className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-purple-500" />
                    Step-by-step breakdowns of processes
                  </li>
                </ul>
              </div>
              {lessonContent.length < 50 && (
                <div className="rounded-lg border border-yellow-500/50 p-3 bg-yellow-500/10">
                  <p className="text-sm text-yellow-200">
                    ⚠️ Add more lesson content first (at least a paragraph) so AI has something to work with.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button 
                onClick={handleAIGenerate} 
                disabled={isGenerating || lessonContent.length < 50}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Components
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
