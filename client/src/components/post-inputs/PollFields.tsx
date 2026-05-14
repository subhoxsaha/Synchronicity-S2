import React from 'react';
import { Calendar, Plus, X, BarChart3 } from 'lucide-react';

interface PollFieldsProps {
  questions: { question: string; options: string[] }[];
  onChange: (questions: { question: string; options: string[] }[]) => void;
  deadline: string;
  onDeadlineChange: (v: string) => void;
  isAnonymous: boolean;
  onAnonChange: (v: boolean) => void;
}

export function PollFields({ questions, onChange, deadline, onDeadlineChange, isAnonymous, onAnonChange }: PollFieldsProps) {
  const addQuestion = () => onChange([...questions, { question: '', options: ['', ''] }]);
  const removeQuestion = (i: number) => onChange(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, q: string) => {
    const copy = [...questions];
    copy[i] = { ...copy[i], question: q };
    onChange(copy);
  };
  const updateOption = (qi: number, oi: number, v: string) => {
    const copy = [...questions];
    copy[qi].options[oi] = v;
    onChange(copy);
  };
  const addOption = (qi: number) => {
    const copy = [...questions];
    copy[qi].options.push('');
    onChange(copy);
  };
  const removeOption = (qi: number, oi: number) => {
    const copy = [...questions];
    copy[qi].options = copy[qi].options.filter((_, i) => i !== oi);
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-accent/10 rounded-2xl p-4 border border-border/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Question {qi + 1}</span>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qi)} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
          <input
            type="text" placeholder="Your question..."
            className="bg-transparent border-none outline-none text-xs font-bold w-full"
            value={q.question} onChange={e => updateQuestion(qi, e.target.value)}
          />
          <div className="space-y-2 pl-3 border-l-2 border-primary/30">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-primary shrink-0" />
                <input
                  type="text" placeholder={`Option ${oi + 1}`}
                  className="bg-transparent border-none outline-none text-[11px] font-medium w-full"
                  value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                />
                {q.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(qi, oi)} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addOption(qi)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add Option
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="w-full py-2 border border-dashed border-primary/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
        + Add Question
      </button>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Calendar className="h-5 w-5 text-primary shrink-0" />
        <input type="date" className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full" value={deadline} onChange={e => onDeadlineChange(e.target.value)} />
        <span className="text-[8px] font-bold text-muted-foreground whitespace-nowrap">DEADLINE</span>
      </div>
      <label className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20 cursor-pointer">
        <input type="checkbox" checked={isAnonymous} onChange={e => onAnonChange(e.target.checked)} className="accent-primary" />
        <span className="text-xs font-bold">Anonymous Responses</span>
      </label>
    </div>
  );
}
