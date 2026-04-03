import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import BorderGlow from '../components/animations/BorderGlow';
import { useNotification } from '../context/NotificationContext';

const QuizCreator = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [step, setStep] = useState(1);
    const [quizDetails, setQuizDetails] = useState({
        title: '',
        category: 'Quantitative Aptitude',
        difficulty: 'Medium',
        timeLimit: 10,
        marksPerQuestion: 1,
        negativeMarks: 0,
        questions: []
    });

    useEffect(() => {
        if (isEdit) {
            const fetchQuiz = async () => {
                try {
                    const res = await axios.get(`/api/quizzes/${id}`);
                    setQuizDetails(res.data);
                    setStep(3); // Jump to review for editing
                } catch (err) {
                    showNotification('Protocol Failure: Unable to load quiz resources.', 'error');
                    navigate('/admin');
                }
            };
            fetchQuiz();
        }
    }, [id, isEdit, navigate]);

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [aiParams, setAiParams] = useState({ topic: '', numQuestions: 5 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualQuestion, setManualQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        section: ''
    });

    const handleAiGenerate = async () => {
        if (!aiParams.topic) return showNotification('Please specify an research objective.', 'error');
        setIsGenerating(true);
        try {
            const res = await axios.post('/api/ai/generate-questions', {
                ...aiParams,
                category: quizDetails.category,
                difficulty: quizDetails.difficulty
            });

            // Normalize questions to match schema
            const normalizedQuestions = res.data.map(q => ({
                question: q.question || q.text || '',
                options: q.options || q.choices || [],
                correctAnswer: q.correctAnswer || q.correct_answer || '',
                explanation: q.explanation || '',
                section: aiParams.topic || 'AI Generated'
            }));

            // Validate normalized questions
            const validQuestions = normalizedQuestions.filter(q => q.question && q.options.length >= 2 && q.correctAnswer);

            if (validQuestions.length === 0) {
                showNotification('The AI generated invalid questions. Please try again with a different topic.', 'error');
                return;
            }

            setQuizDetails(prev => ({ ...prev, questions: [...prev.questions, ...validQuestions] }));
            setStep(3);
        } catch (err) {
            console.error('AI Gen Error:', err.response?.data || err.message);
            showNotification('Neural network generation failure. Please try again.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddManualQuestion = (stayOnForm = false) => {
        if (!manualQuestion.question || manualQuestion.options.some(o => !o) || !manualQuestion.correctAnswer) {
            return showNotification('Incomplete form fields detected.', 'error');
        }

        // Ensure correctAnswer is exactly one of the options
        if (!manualQuestion.options.includes(manualQuestion.correctAnswer)) {
            return showNotification('Correct answer must exactly match one of the specified options.', 'error');
        }

        setQuizDetails(prev => ({ ...prev, questions: [...prev.questions, manualQuestion] }));
        setManualQuestion({ ...manualQuestion, question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
        if (!stayOnForm) {
            setShowManualForm(false);
            setStep(3);
        }
    };

    const handleSaveQuiz = async () => {
        if (!quizDetails.title.trim()) return showNotification('Quiz title is required for protocol registration.', 'error');
        if (quizDetails.questions.length === 0) return showNotification('At least one question is required.', 'error');

        // Clean data for API
        const cleanedQuiz = {
            title: quizDetails.title,
            category: quizDetails.category,
            difficulty: quizDetails.difficulty,
            timeLimit: parseInt(quizDetails.timeLimit) || 10,
            marksPerQuestion: parseFloat(quizDetails.marksPerQuestion) || 1,
            negativeMarks: parseFloat(quizDetails.negativeMarks) || 0,
            questions: quizDetails.questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                section: q.section || 'General'
            }))
        };

        try {
            if (isEdit) {
                await axios.put(`/api/quizzes/${id}`, cleanedQuiz);
            } else {
                await axios.post('/api/quizzes', cleanedQuiz);
            }
            navigate('/admin');
        } catch (err) {
            console.error('Quiz Save Error:', err.response?.data || err.message);
            const msg = err.response?.data?.message || err.message;
            showNotification(isEdit ? `Update failed: ${msg}` : `Save failed: ${msg}`, 'error');
        }
    };

    const steps = [
        { id: 1, label: 'Settings', icon: 'settings' },
        { id: 2, label: 'Add Content', icon: 'auto_awesome' },
        { id: 3, label: 'Review', icon: 'fact_check' }
    ];

    return (
        <div className="min-h-screen bg-surface pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-8 lg:px-24">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <header className="w-full flex flex-col items-center justify-center gap-10 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Quiz Builder</span>
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface leading-none uppercase text-center">
                            {isEdit ? 'Edit' : 'Create'} <br /><span className="gradient-text italic px-2">Quiz</span>.
                        </motion.h2>
                    </div>
                </header>

                {/* Step Indicator */}
                <div className="flex items-center justify-between max-w-3xl mx-auto bg-surface-container p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden overflow-x-auto scrollbar-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                    <motion.div className="absolute top-0 left-0 h-1 editorial-gradient shadow-sm shadow-primary/20 transition-all duration-700" style={{ width: `${(step / 3) * 100}%` }} />
                    <div className="flex items-center justify-between w-full min-w-max gap-8 px-2">
                        {steps.map(s => (
                            <div key={s.id} onClick={() => setStep(s.id)} className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 font-black font-headline tracking-[0.2em] transition-all cursor-pointer hover:opacity-100 uppercase text-[8px] sm:text-[9px] ${step >= s.id ? 'text-on-surface' : 'text-on-surface-variant opacity-30'}`}>
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'editorial-gradient text-white shadow-xl shadow-primary/20 scale-110' : 'bg-surface-container-high border-2 border-white/5'}`}>
                                    <span className="material-symbols-outlined text-sm sm:text-[18px]">{s.icon}</span>
                                </div>
                                <span className="">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div
                    key={step + (showManualForm ? '-manual' : '')}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface-container/80 backdrop-blur-3xl w-full max-w-5xl mx-auto p-8 sm:p-12 md:p-20 rounded-[2.5rem] sm:rounded-[4rem] border border-white/5 shadow-3xl shadow-black/50 relative min-h-[500px] sm:min-h-[600px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>

                    {step === 1 && (
                        <div className="space-y-12">
                            <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none border-l-4 border-primary pl-6">Quiz Details.</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                                <div className="md:col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Quiz Title</label>
                                    <input
                                        className="w-full bg-surface border-none rounded-3xl py-6 px-10 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-sm font-semibold outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface"
                                        placeholder="e.g. General Knowledge"
                                        value={quizDetails.title}
                                        onChange={(e) => setQuizDetails({ ...quizDetails, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4 text-left">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Category</label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            className="w-full bg-surface-container-high border-none rounded-2xl py-6 px-10 font-semibold font-headline transition-all shadow-sm text-on-surface cursor-pointer flex justify-between items-center group"
                                        >
                                            <span className="text-sm uppercase tracking-widest">{quizDetails.category}</span>
                                            <span className={`material-symbols-outlined text-primary group-hover:translate-y-1 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}>expand_more</span>
                                        </div>

                                        <AnimatePresence>
                                            {showCategoryDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-[100] w-full mt-4 bg-surface-container rounded-[2rem] border border-white/5 shadow-2xl max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent"
                                                >
                                                    {[
                                                        "Analytical & Critical Reasoning",
                                                        "Communication Skills",
                                                        "General & Current Affairs",
                                                        "Logical Reasoning",
                                                        "Quantitative Aptitude",
                                                        "Technical Awareness",
                                                        "Verbal Ability"
                                                    ].map(cat => (
                                                        <div
                                                            key={cat}
                                                            onClick={() => {
                                                                setQuizDetails({ ...quizDetails, category: cat });
                                                                setShowCategoryDropdown(false);
                                                            }}
                                                            className={`px-8 py-4 hover:bg-white/5 transition-colors cursor-pointer font-black font-headline text-[10px] uppercase tracking-widest ${quizDetails.category === cat ? 'text-primary bg-primary/10' : 'text-on-surface-variant'}`}
                                                        >
                                                            {cat}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Difficulty</label>
                                    <div className="flex bg-surface-container-high p-2 rounded-2xl border border-white/5">
                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                            <button key={d} onClick={() => setQuizDetails({ ...quizDetails, difficulty: d })} className={`flex-1 py-4 rounded-xl font-headline font-black text-[10px] uppercase tracking-widest transition-all ${quizDetails.difficulty === d ? 'editorial-gradient text-white shadow-xl shadow-primary/20 scale-105' : 'text-on-surface-variant hover:text-on-surface'}`}>{d}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Time Limit (Minutes)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface border-none rounded-2xl py-6 px-8 font-headline text-sm font-semibold outline-none shadow-sm text-center"
                                        value={quizDetails.timeLimit}
                                        onChange={(e) => setQuizDetails({ ...quizDetails, timeLimit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full py-5 sm:py-7 editorial-gradient rounded-2xl sm:rounded-3xl font-headline font-black text-base sm:text-lg tracking-tight text-white shadow-3xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase">{isEdit ? 'Go to Questions' : 'Next Step'} <span className="material-symbols-outlined">arrow_forward</span></button>
                        </div>
                    )}

                    {step === 2 && !showManualForm && (
                        <div className="space-y-16">
                            <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none border-l-4 border-primary pl-6">Select a Method.</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                                <div className="h-full">
                                    <BorderGlow borderRadius={56} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                                        <div className="p-8 sm:p-12 space-y-8 sm:space-y-10 flex flex-col items-center text-center group transition-all duration-700 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform"></div>
                                            <div className="w-24 h-24 editorial-gradient rounded-3xl flex items-center justify-center text-white rotate-6 group-hover:rotate-0 transition-all shadow-3xl shadow-primary/30">
                                                <span className="material-symbols-outlined text-5xl">cognition</span>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-2xl font-black font-headline tracking-tighter text-on-surface uppercase">AI Generator.</h4>
                                                <p className="text-on-surface-variant font-medium leading-relaxed italic">"Let AI help you generate questions based on your quiz topic."</p>
                                            </div>
                                            <div className="w-full space-y-6 pt-6 text-left">
                                                <div className="space-y-3">
                                                    <input className="w-full bg-surface-container border-none rounded-2xl py-4 px-6 text-sm font-headline font-bold outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface ring-2 ring-transparent focus:ring-primary/10 transition-all" placeholder="Topic (e.g. Science)" value={aiParams.topic} onChange={(e) => setAiParams({ ...aiParams, topic: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex justify-between px-1">How many questions? {aiParams.numQuestions}</label>
                                                    <input type="range" min="1" max="20" step="1" className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" value={aiParams.numQuestions} onChange={(e) => setAiParams({ ...aiParams, numQuestions: parseInt(e.target.value) })} />
                                                </div>
                                                <button
                                                    onClick={handleAiGenerate}
                                                    disabled={isGenerating}
                                                    className="w-full py-5 sm:py-7 editorial-gradient text-white rounded-2xl sm:rounded-3xl font-black font-headline text-xs sm:text-sm md:text-base tracking-widest shadow-3xl shadow-primary/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase whitespace-nowrap"
                                                >
                                                    {isGenerating ? 'Generating...' : 'Generate Questions'} <span className="material-symbols-outlined text-sm sm:text-lg">{isGenerating ? 'slow_motion_video' : 'auto_awesome'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </BorderGlow>
                                </div>

                                <div className="h-full">
                                    <BorderGlow borderRadius={56} backgroundColor="rgba(10, 10, 12, 0.4)" colors={['#c084fc', '#f472b6', '#38bdf8']} glowIntensity={1}>
                                        <div className="p-8 sm:p-12 h-full space-y-8 sm:space-y-10 flex flex-col items-center text-center group transition-all duration-700 relative overflow-hidden">
                                            <div className="w-24 h-24 bg-surface-container-high rounded-3xl border-2 border-white/5 flex items-center justify-center text-on-surface-variant -rotate-6 group-hover:rotate-0 transition-all shadow-xl">
                                                <span className="material-symbols-outlined text-5xl">edit_note</span>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-2xl font-black font-headline tracking-tighter text-on-surface uppercase">Add Questions.</h4>
                                                <p className="text-on-surface-variant font-medium leading-relaxed italic">"Create your own questions and options with detailed explanations."</p>
                                            </div>
                                            <button
                                                onClick={() => setShowManualForm(true)}
                                                className="w-full mt-auto py-5 sm:py-7 bg-white/5 border-2 border-white/5 text-on-surface rounded-2xl sm:rounded-3xl font-black font-headline text-xs sm:text-sm md:text-base tracking-widest uppercase flex items-center justify-center gap-4 hover:bg-white/10 group-hover:border-primary transition-all shadow-sm whitespace-nowrap"
                                            >
                                                Create Questions <span className="material-symbols-outlined text-sm sm:text-lg">terminal</span>
                                            </button>
                                        </div>
                                    </BorderGlow>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && showManualForm && (
                        <div className="space-y-12">
                            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6 sm:pb-8 gap-4">
                                <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none border-l-4 border-primary pl-6">New Question.</h3>
                                <button onClick={() => setShowManualForm(false)} className="w-full sm:w-auto bg-white/5 px-6 py-2 rounded-full text-on-surface-variant hover:text-on-surface font-black font-headline text-[10px] tracking-widest uppercase transition-all shadow-sm">Cancel</button>
                            </div>
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Section</label>
                                    <input className="w-full bg-surface-container-high border-none rounded-2xl py-5 px-8 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-lg font-bold outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface" placeholder="e.g. General" value={manualQuestion.section || ''} onChange={(e) => setManualQuestion({ ...manualQuestion, section: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Question Text</label>
                                    <textarea className="w-full bg-surface-container-high border-none rounded-[1.5rem] sm:rounded-[2rem] py-6 sm:py-8 px-6 sm:px-10 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-lg sm:text-2xl font-black outline-none shadow-sm placeholder:text-on-surface-variant/20 text-on-surface resize-none h-32 sm:h-40" placeholder="Enter your question here..." value={manualQuestion.question} onChange={(e) => setManualQuestion({ ...manualQuestion, question: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {manualQuestion.options.map((opt, i) => (
                                        <div key={i} className="space-y-3">
                                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 flex items-center justify-between">
                                                Option {String.fromCharCode(65 + i)}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] opacity-40">Correct?</span>
                                                    <input type="radio" name="correct" checked={manualQuestion.correctAnswer === opt && opt !== ''} onChange={() => setManualQuestion({ ...manualQuestion, correctAnswer: opt })} className="accent-primary w-4 h-4 cursor-pointer" />
                                                </div>
                                            </label>
                                            <input className="w-full bg-surface-container-high border-none rounded-2xl py-5 px-8 focus:ring-4 focus:ring-primary/10 transition-all font-headline font-bold outline-none shadow-sm text-sm text-on-surface" placeholder={`Enter option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => {
                                                const newOpts = [...manualQuestion.options];
                                                newOpts[i] = e.target.value;
                                                const wasCorrect = manualQuestion.correctAnswer === opt && opt !== '';
                                                setManualQuestion({
                                                    ...manualQuestion,
                                                    options: newOpts,
                                                    correctAnswer: wasCorrect ? e.target.value : manualQuestion.correctAnswer
                                                });
                                            }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] font-headline ml-1">Explanation</label>
                                    <textarea className="w-full bg-surface-container-high border-none rounded-2xl py-6 px-10 focus:ring-4 focus:ring-primary/10 transition-all font-headline text-lg font-medium italic outline-none shadow-sm placeholder:text-on-surface-variant/30 text-on-surface resize-none h-24" placeholder="Explain why the answer is correct..." value={manualQuestion.explanation || ''} onChange={(e) => setManualQuestion({ ...manualQuestion, explanation: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">
                                    <button onClick={() => handleAddManualQuestion(false)} className="py-5 sm:py-6 rounded-2xl sm:rounded-3xl border-2 border-white/5 font-headline font-black text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all">Save & Review</button>
                                    <button onClick={() => handleAddManualQuestion(true)} className="py-5 sm:py-6 editorial-gradient text-white rounded-2xl sm:rounded-3xl font-headline font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">Save & Add Another <span className="material-symbols-outlined text-sm">add</span></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-12 sm:space-y-16">
                            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-surface-container pb-8 sm:pb-10 gap-4">
                                <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-on-surface uppercase leading-none border-l-4 border-primary pl-6">Questions Review.</h3>
                                <div className="px-6 sm:px-8 py-2 sm:py-3 bg-primary/5 rounded-full font-black font-headline text-[10px] tracking-widest uppercase text-primary border border-primary/10 shadow-sm">{quizDetails.questions.length} Questions</div>
                            </div>

                            <div className="space-y-6 sm:space-y-12 max-h-[500px] sm:max-h-[700px] overflow-y-auto pr-2 sm:pr-8 pb-12 sm:pb-32 px-1 sm:px-10 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                                {quizDetails.questions.map((q, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/5 p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 space-y-6 sm:space-y-8 relative group hover:bg-white/10 hover:shadow-2xl transition-all duration-500 mb-4 mx-1">
                                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                                            <div className="gap-3 sm:gap-6 flex items-start flex-1 min-w-0">
                                                <span className="w-9 h-9 sm:w-12 sm:h-12 editorial-gradient rounded-lg sm:rounded-xl text-white flex items-center justify-center font-black font-headline text-sm sm:text-lg shadow-xl shadow-primary/20 shrink-0">{idx + 1}</span>
                                                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                                                    {q.section && <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary block leading-tight">{q.section}</span>}
                                                    <h4 className="text-base sm:text-2xl font-black font-headline tracking-tight text-on-surface leading-snug break-words">{q.question}</h4>
                                                </div>
                                            </div>
                                            <button onClick={() => setQuizDetails(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }))} className="w-9 h-9 sm:w-12 sm:h-12 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 text-on-surface-variant hover:text-error hover:shadow-lg transition-all flex items-center justify-center sm:opacity-0 group-hover:opacity-100 shrink-0"><span className="material-symbols-outlined text-lg sm:text-xl">delete_forever</span></button>
                                        </div>
                                        {q.explanation && (
                                            <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 italic font-medium text-on-surface-variant text-[11px] sm:text-sm border border-white/5 relative">
                                                <span className="absolute -top-3 left-6 px-3 py-1 bg-surface-container border border-white/5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-primary shadow-sm">Explanation</span>
                                                "{q.explanation}"
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-wide flex items-center gap-2 sm:gap-4 border-2 transition-all ${opt === q.correctAnswer ? 'bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-transparent text-on-surface-variant opacity-60'}`}>
                                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${opt === q.correctAnswer ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface-variant'}`}>{String.fromCharCode(65 + i)}</div>
                                                    <span className="flex-1 break-words">{opt}</span>
                                                    {opt === q.correctAnswer && <span className="material-symbols-outlined text-primary text-[14px] sm:text-sm shrink-0">verified</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                                {quizDetails.questions.length === 0 && <div className="text-center py-20 sm:py-32 bg-white/5 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-white/10 text-on-surface-variant font-headline font-bold italic opacity-40 uppercase tracking-[0.2em] text-[10px] sm:text-sm">No questions added yet.</div>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-white/5">
                                <button onClick={() => setStep(2)} className="py-5 sm:py-6 rounded-2xl sm:rounded-3xl border-2 border-white/5 font-headline font-black text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all flex items-center justify-center gap-4"><span className="material-symbols-outlined">add</span> Add More</button>
                                <button onClick={handleSaveQuiz} className="py-5 sm:py-6 editorial-gradient text-white rounded-2xl sm:rounded-3xl font-headline font-black text-base sm:text-lg tracking-tight shadow-3xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase">{isEdit ? 'Update Quiz' : 'Create Quiz'} <span className="material-symbols-outlined">rocket_launch</span></button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default QuizCreator;
