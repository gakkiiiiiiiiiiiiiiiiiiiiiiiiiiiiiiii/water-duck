import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, X, Trophy, RefreshCcw, Droplets, Check } from 'lucide-react';

// --- 默认配置数据 ---
const DAILY_GOAL = 2000;

const generateDailyTasks = () => [
	{ id: 1, time: '08:00', label: '早安一杯水', amount: 250, completed: false, image: null, color: 'bg-pink-200' },
	{ id: 2, time: '10:00', label: '工作补充', amount: 300, completed: false, image: null, color: 'bg-blue-200' },
	{ id: 3, time: '12:30', label: '午餐后', amount: 250, completed: false, image: null, color: 'bg-yellow-200' },
	{ id: 4, time: '15:00', label: '下午茶时刻', amount: 300, completed: false, image: null, color: 'bg-green-200' },
	{ id: 5, time: '17:30', label: '下班补水', amount: 300, completed: false, image: null, color: 'bg-purple-200' },
	{ id: 6, time: '20:00', label: '晚间放松', amount: 300, completed: false, image: null, color: 'bg-indigo-200' },
	{ id: 7, time: '22:00', label: '睡前小酌', amount: 300, completed: false, image: null, color: 'bg-orange-200' },
];

// --- 3D 鸭子组件 ---
const DuckAvatar = ({ mood, onClick }) => {
	const isThirsty = mood === 'thirsty';

	return (
		<div
			className="relative w-64 h-64 cursor-pointer transition-transform hover:scale-105 active:scale-95"
			onClick={onClick}
		>
			{/* 身体 (Body) */}
			<div
				className={`
        absolute bottom-0 left-1/2 transform -translate-x-1/2 
        w-48 h-40 rounded-[50%] 
        ${
					isThirsty
						? 'bg-yellow-200 shadow-inner'
						: 'bg-yellow-300 shadow-[inset_-10px_-10px_20px_rgba(255,200,0,0.5),10px_10px_20px_rgba(0,0,0,0.1)]'
				}
        transition-colors duration-500
      `}
			></div>

			{/* 头 (Head) */}
			<div
				className={`
        absolute top-8 left-1/2 transform -translate-x-1 
        w-36 h-36 rounded-full 
        ${isThirsty ? 'bg-yellow-200' : 'bg-yellow-300'}
        shadow-[inset_-5px_-5px_15px_rgba(255,200,0,0.4),5px_5px_15px_rgba(255,255,255,0.4)]
        transition-colors duration-500 z-10 animate-float
      `}
			>
				{/* 眼睛 (Eyes) - 使用深色slate保持眼神 */}
				<div className="absolute top-12 left-6 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
					{/* 高光 */}
					{!isThirsty && <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>}
					{/* 渴了的时候 */}
					{isThirsty && <div className="w-6 h-1 bg-white rotate-45 absolute"></div>}
					{isThirsty && <div className="w-6 h-1 bg-white -rotate-45 absolute"></div>}
				</div>
				<div className="absolute top-12 right-6 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
					{!isThirsty && <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>}
					{isThirsty && <div className="w-6 h-1 bg-white rotate-45 absolute"></div>}
					{isThirsty && <div className="w-6 h-1 bg-white -rotate-45 absolute"></div>}
				</div>

				{/* 腮红 (Blush) */}
				{!isThirsty && (
					<>
						<div className="absolute top-20 left-4 w-6 h-4 bg-pink-300 rounded-full blur-sm opacity-60"></div>
						<div className="absolute top-20 right-4 w-6 h-4 bg-pink-300 rounded-full blur-sm opacity-60"></div>
					</>
				)}

				{/* 嘴巴 (Beak) */}
				<div
					className={`
          absolute top-20 left-1/2 transform -translate-x-1/2 
          w-16 h-10 bg-orange-400 rounded-[40%] 
          border-b-4 border-orange-500
          transition-all duration-300
          ${isThirsty ? 'h-12 w-14 mt-2' : ''}
        `}
				>
					{isThirsty && (
						<div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-400 rounded-full border-2 border-orange-500"></div>
					)}
				</div>

				{/* 汗滴 */}
				{isThirsty && (
					<div className="absolute top-4 right-2 w-4 h-6 bg-blue-300 rounded-full rounded-tl-none animate-bounce opacity-80"></div>
				)}
			</div>

			{/* 翅膀 (Wings) */}
			<div
				className={`
        absolute top-28 left-4 w-12 h-20 bg-yellow-300 rounded-full rotate-12 z-0
        ${isThirsty ? 'rotate-[30deg] top-32' : 'animate-wing-left'}
      `}
			></div>
			<div
				className={`
        absolute top-28 right-4 w-12 h-20 bg-yellow-300 rounded-full -rotate-12 z-0
        ${isThirsty ? '-rotate-[30deg] top-32' : 'animate-wing-right'}
      `}
			></div>

			{/* 阴影 */}
			<div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-32 h-4 bg-indigo-900/10 rounded-full blur-md"></div>
		</div>
	);
};

// --- 主应用 ---
export default function App() {
	// 从 URL 参数获取名字
	const [searchParams] = useSearchParams();
	const userName = searchParams.get('name') || '欧香香';

	// 从 localStorage 初始化任务
	const initializeTasks = () => {
		try {
			const savedDate = localStorage.getItem('water_date');
			const today = new Date().toDateString();

			if (savedDate === today) {
				// 同一天，加载保存的任务
				const savedTasksStr = localStorage.getItem('water_tasks');
				if (savedTasksStr) {
					try {
						const savedTasks = JSON.parse(savedTasksStr);
						if (Array.isArray(savedTasks) && savedTasks.length > 0) {
							return savedTasks;
						}
					} catch (parseError) {
						console.error('解析保存的任务数据失败:', parseError);
					}
				}
			} else {
				// 新的一天，重置数据
				localStorage.setItem('water_date', today);
				const newTasks = generateDailyTasks();
				localStorage.setItem('water_tasks', JSON.stringify(newTasks));
				return newTasks;
			}
		} catch (error) {
			console.error('初始化 localStorage 失败:', error);
		}
		// 如果出错或没有保存的数据，使用默认任务
		return generateDailyTasks();
	};

	const [tasks, setTasks] = useState(initializeTasks);
	const [currentIntake, setCurrentIntake] = useState(0);
	const [showCamera, setShowCamera] = useState(false);
	const [activeTaskId, setActiveTaskId] = useState(null);
	const [showCelebration, setShowCelebration] = useState(false);
	const [duckMood, setDuckMood] = useState('happy');

	// 计算状态函数
	const calculateStatus = useCallback((taskList) => {
		const total = taskList.reduce((acc, task) => (task.completed ? acc + task.amount : acc), 0);
		setCurrentIntake(total);

		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();
		const currentTimeValue = currentHour * 60 + currentMinute;

		const firstIncompleteTask = taskList.find((t) => !t.completed);

		if (firstIncompleteTask) {
			const [h, m] = firstIncompleteTask.time.split(':').map(Number);
			const taskTimeValue = h * 60 + m;

			if (currentTimeValue > taskTimeValue + 30) {
				setDuckMood('thirsty');
			} else {
				setDuckMood('happy');
			}
		} else {
			setDuckMood('happy');
		}
	}, []);

	// 初始化时计算状态
	useEffect(() => {
		calculateStatus(tasks);
	}, [calculateStatus, tasks]);

	// 保存任务到 localStorage 并更新状态
	useEffect(() => {
		try {
			const today = new Date().toDateString();
			const savedDate = localStorage.getItem('water_date');

			// 只保存当天的数据
			if (savedDate === today) {
				localStorage.setItem('water_tasks', JSON.stringify(tasks));
			}
		} catch (error) {
			console.error('保存任务到 localStorage 失败:', error);
		}
	}, [tasks]);

	const handleDuckClick = () => {
		const nextTask = tasks.find((t) => !t.completed);
		if (nextTask) {
			handleTaskClick(nextTask);
		} else {
			playSuccessSound(800);
		}
	};

	const handleTaskClick = (task) => {
		if (task.completed) return;
		setActiveTaskId(task.id);
		setShowCamera(true);
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file && activeTaskId) {
			const reader = new FileReader();
			reader.onloadend = () => {
				completeTask(activeTaskId, reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const completeTask = (id, imageUrl) => {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true, image: imageUrl } : t)));
		setShowCamera(false);
		triggerCelebration();
		playSuccessSound();
	};

	const triggerCelebration = () => {
		setShowCelebration(true);
		setTimeout(() => setShowCelebration(false), 2000);
	};

	const playSuccessSound = (freq = 523.25) => {
		try {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (!AudioContext) return;
			const ctx = new AudioContext();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = 'sine';
			const now = ctx.currentTime;
			osc.frequency.setValueAtTime(freq, now);
			osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.1);
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
			osc.start(now);
			osc.stop(now + 0.5);
		} catch (e) {
			console.error(e);
		}
	};

	// 计算进度百分比
	const progressPercent = Math.min((currentIntake / DAILY_GOAL) * 100, 100);
	const nextTask = tasks.find((t) => !t.completed);

	return (
		// 使用 indigo-800 作为主要的深色文字，替代纯黑/灰，更加柔和
		<div className="min-h-screen bg-[#FFFBEB] font-sans text-indigo-800 relative overflow-hidden select-none max-w-md mx-auto shadow-2xl flex flex-col">
			{/* 顶部简单的Header */}
			<header className="pt-12 px-6 flex justify-between items-center z-10">
				<div>
					{/* 标题颜色: 深靛蓝 */}
					<h1 className="text-xl font-bold text-indigo-950 tracking-wide">{userName}今天喝水了没</h1>
					{/* 次要信息颜色: 柔和的紫灰 */}
					<p className="text-xs text-indigo-400 mt-1">今日已喝 {currentIntake}ml</p>
				</div>
				<div className="bg-white/80 p-2 rounded-full shadow-sm border border-indigo-50 active:scale-95 transition-transform">
					{/* 图标颜色 */}
					<RefreshCcw
						size={18}
						className="text-indigo-300"
						onClick={() => {
							if (window.confirm('重置今天的数据?')) {
								setTasks(generateDailyTasks());
							}
						}}
					/>
				</div>
			</header>

			{/* 中间核心区域：鸭子 */}
			<div className="flex-1 flex flex-col items-center justify-center relative z-0 w-full">
				{/* 气泡提示 - 边框和文字颜色优化 */}
				<div
					className={`
          mb-6 bg-white px-6 py-3 rounded-2xl rounded-bl-none shadow-[0_4px_20px_rgba(200,200,255,0.2)] border-2 border-indigo-50
          transform transition-all duration-500 max-w-[80%]
          ${duckMood === 'thirsty' ? 'animate-bounce border-pink-200' : ''}
        `}
				>
					<p className="text-sm font-bold text-indigo-800">
						{duckMood === 'thirsty'
							? `嘎...我好渴...快完成 ${nextTask?.time} 的打卡！`
							: nextTask
							? `下一杯水在 ${nextTask.time} 哦~`
							: '哇！今天的任务全搞定啦！'}
					</p>
				</div>

				{/* 鸭子本体 + 进度条容器 (使用相对定位容器来固定布局关系) */}
				<div className="relative w-80 h-72 flex justify-center items-center">
					{/* 鸭子 */}
					<div className="z-10">
						<DuckAvatar mood={duckMood} onClick={handleDuckClick} />
					</div>

					{/* 新增：可爱风格垂直进度条 - 放在鸭子右侧 */}
					<div className="absolute right-0 bottom-8 z-20 flex flex-col items-center gap-1 transition-all duration-500 hover:scale-105">
						{/* 顶部气泡百分比 */}
						<div className="bg-white px-2 py-1 rounded-lg shadow-sm border border-indigo-50 mb-1">
							<span className="text-xs font-bold text-blue-400 block text-center leading-none">
								{Math.round(progressPercent)}%
							</span>
						</div>

						{/* 进度条槽：模拟温度计/量杯风格 */}
						<div className="w-6 h-32 bg-white rounded-full border-4 border-white shadow-[0_0_15px_rgba(200,200,255,0.3)] ring-1 ring-indigo-50 overflow-hidden relative">
							{/* 背景底色 */}
							<div className="absolute inset-0 bg-indigo-50/50"></div>

							{/* 水柱 */}
							<div
								className="absolute bottom-0 w-full bg-gradient-to-t from-blue-300 to-blue-200 transition-all duration-1000 rounded-t-sm"
								style={{ height: `${progressPercent}%` }}
							>
								{/* 顶部高光线 */}
								<div className="w-full h-[2px] bg-white/50 absolute top-0"></div>
								{/* 气泡装饰 */}
								<div
									className="absolute bottom-2 left-1 w-1 h-1 bg-white/60 rounded-full animate-bounce"
									style={{ animationDuration: '2s' }}
								></div>
								<div
									className="absolute bottom-6 right-1.5 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
									style={{ animationDuration: '3s', animationDelay: '0.5s' }}
								></div>
							</div>

							{/* 刻度线 (覆盖在水柱之上) */}
							<div className="absolute inset-0 flex flex-col justify-evenly py-2 px-1 z-10 pointer-events-none">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="w-1.5 h-[1.5px] bg-indigo-300/30 self-end rounded-full"></div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* 交互按钮 */}
				{nextTask && (
					<button
						onClick={() => handleTaskClick(nextTask)}
						className={`
              mt-4 px-8 py-3 rounded-full font-bold text-white shadow-lg transform active:scale-95 transition-all
              flex items-center gap-2
              ${
								duckMood === 'thirsty'
									? 'bg-pink-400 hover:bg-pink-500 shadow-pink-200/50 animate-pulse'
									: 'bg-blue-400 hover:bg-blue-500 shadow-blue-200/50'
							}
            `}
					>
						<Droplets size={20} fill="currentColor" />
						{duckMood === 'thirsty' ? '快去喝水！' : '打卡喝水'}
					</button>
				)}
			</div>

			{/* 底部任务时间轴 */}
			<div className="bg-white/90 backdrop-blur-sm rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(100,100,200,0.05)] pt-8 pb-8 px-6 z-10">
				{/* 列表标题颜色 */}
				<h3 className="text-sm font-bold text-indigo-300 mb-4 ml-2">今日任务清单</h3>
				<div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
					{tasks.map((task) => (
						<div
							key={task.id}
							onClick={() => handleTaskClick(task)}
							className={`
                snap-start shrink-0 w-20 flex flex-col items-center gap-2 cursor-pointer transition-all
                ${task.completed ? 'opacity-50' : 'opacity-100 scale-100'}
              `}
						>
							<div
								className={`
                w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all
                ${
									task.completed
										? 'bg-green-100 border-green-200'
										: activeTaskId === task.id
										? 'bg-indigo-50 border-blue-300 scale-110'
										: 'bg-indigo-50/50 border-transparent'
								}
              `}
							>
								{task.completed ? (
									<Check size={20} className="text-green-500" />
								) : (
									<span className="text-xs font-bold text-indigo-400">{task.time}</span>
								)}
							</div>
							<span className="text-[10px] text-indigo-300 font-medium truncate w-full text-center">
								{task.amount}ml
							</span>
						</div>
					))}
				</div>
			</div>

			{/* 相机 Modal */}
			{showCamera && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-indigo-900/20 backdrop-blur-sm animate-fade-in max-w-md mx-auto">
					<div className="bg-white w-full p-6 rounded-t-[40px] shadow-2xl animate-slide-up relative">
						<div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-indigo-100 rounded-full"></div>
						<div className="flex justify-between items-center mb-6 mt-2">
							<h3 className="text-xl font-bold text-indigo-900">喝水打卡</h3>
							<button
								onClick={() => setShowCamera(false)}
								className="p-2 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors"
							>
								<X size={20} className="text-indigo-400" />
							</button>
						</div>
						<div className="aspect-[3/4] bg-indigo-50 rounded-3xl mb-6 flex flex-col items-center justify-center relative overflow-hidden border-2 border-indigo-100 border-dashed">
							<Camera className="w-16 h-16 text-indigo-200 mb-4" />
							<p className="text-indigo-300 text-sm">拍摄你的水杯</p>
						</div>
						<div className="flex justify-center mb-4">
							<label className="relative cursor-pointer">
								<input
									type="file"
									accept="image/*"
									capture="environment"
									className="hidden"
									onChange={handleImageUpload}
								/>
								<div className="w-20 h-20 rounded-full border-4 border-indigo-100 p-1 flex items-center justify-center active:scale-95 transition-transform">
									<div className="w-full h-full bg-blue-400 rounded-full shadow-lg flex items-center justify-center">
										<div className="w-16 h-16 border-2 border-white/30 rounded-full"></div>
									</div>
								</div>
							</label>
						</div>
					</div>
				</div>
			)}

			{/* 庆祝动画 */}
			{showCelebration && (
				<div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
					<div className="animate-bounce text-center">
						<Trophy className="w-24 h-24 text-yellow-400 drop-shadow-lg mx-auto mb-2" fill="currentColor" />
						<h2 className="text-3xl font-black text-white stroke-text drop-shadow-md">好喝!</h2>
					</div>
					<Confetti />
				</div>
			)}

			{/* Styles */}
			<style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes wing-left {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(20deg); }
        }
        .animate-wing-left { animation: wing-left 1s ease-in-out infinite; }
        @keyframes wing-right {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(-20deg); }
        }
        .animate-wing-right { animation: wing-right 1s ease-in-out infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s forwards; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
		</div>
	);
}

const Confetti = () => {
	const pieces = Array.from({ length: 30 }).map((_, i) => ({
		id: i,
		left: Math.random() * 100 + '%',
		bg: ['#FCA5A5', '#93C5FD', '#FDE047'][Math.floor(Math.random() * 3)],
		duration: Math.random() * 2 + 1 + 's',
	}));
	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none">
			{pieces.map((p) => (
				<div
					key={p.id}
					className="absolute w-3 h-3 rounded-sm"
					style={{
						left: p.left,
						top: '-20px',
						backgroundColor: p.bg,
						animation: `fall ${p.duration} linear forwards`,
					}}
				/>
			))}
			<style>{`@keyframes fall { to { top: 100vh; transform: rotate(720deg); } }`}</style>
		</div>
	);
};
