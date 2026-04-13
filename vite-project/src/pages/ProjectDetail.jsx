import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import mockApi from "../api/mockApi";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { Plus, ChevronLeft, Trash2, CalendarDays, User as UserIcon, Filter, Layout } from "lucide-react";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { cn } from "../lib/utils";

const STATUSES = {
  todo: { label: "To Do", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", glow: "shadow-slate-500/5" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", glow: "shadow-blue-500/5" },
  done: { label: "Done", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", glow: "shadow-emerald-500/5" }
};

const PRIORITIES = {
  low: { label: "Low", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  medium: { label: "Medium", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400" },
  high: { label: "High", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", status: "todo", priority: "medium", due_date: "", assignee_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mockApi.getProjectById(user.id, id);
      if (res.status === 200) {
        setProject(res.data);
        setTasks(res.data.tasks || []);
      } else {
        navigate("/");
        toast.error("Project not found");
      }
    } catch {
      toast.error("Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  }, [id, user.id, navigate]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await mockApi.getUsers();
      if (res.status === 200) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }, []);

  useEffect(() => {
    loadProject();
    loadUsers();
  }, [loadProject, loadUsers]);

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await mockApi.deleteProject(user.id, id);
      toast.success("Workspace disbanded");
      navigate("/");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || "",
        assignee_id: task.assignee_id || ""
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "", description: "", status: "todo", priority: "medium", due_date: "", assignee_id: ""
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingTask) {
        const res = await mockApi.updateTask(editingTask.id, formData);
        if (res.status === 200) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t));
          toast.success("Task synchronized");
        }
      } else {
        const res = await mockApi.createTask(id, { ...formData });
        if (res.status === 201) {
          setTasks(prev => [...prev, res.data]);
          toast.success("Task deployed to board");
        }
      }
      setIsTaskModalOpen(false);
    } catch {
      toast.error("Synchronization failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task from the workspace?")) return;
    try {
      await mockApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task archived");
    } catch {
      toast.error("Failed to remove task");
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    
    try {
       const res = await mockApi.updateTask(draggableId, { status: newStatus });
       if (res.status !== 200) throw new Error();
    } catch {
       toast.error("Status update failed - reverting");
       setTasks(previousTasks);
    }
  };

  const getAssigneeName = (uid) => {
    const u = users.find(u => u.id === uid);
    return u ? u.name : "Unassigned";
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (isLoading || !project) {
    return (
      <div className="flex flex-col h-96 items-center justify-center space-y-4">
        <Layout className="h-10 w-10 animate-bounce text-primary/20" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing Kanban engine...</p>
      </div>
    );
  }

  const columns = Object.keys(STATUSES);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl hover:bg-secondary shrink-0 mt-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-2">{project.name}</h1>
            <p className="text-muted-foreground font-medium">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDeleteProject} className="rounded-xl h-12 px-5 text-destructive hover:bg-destructive/5 font-bold border-border/60 hover:border-destructive/20">
            <Trash2 className="h-4 w-4 mr-2" /> Disband
          </Button>
          <Button onClick={() => openTaskModal()} className="rounded-xl h-12 px-6 shadow-xl shadow-primary/20 font-bold">
            <Plus className="mr-2 h-5 w-5" /> New Task
          </Button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-border/50">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground px-2">
          <Filter className="h-3.5 w-3.5" /> Filter Matrix
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select 
            className="flex-1 sm:flex-none h-10 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer hover:border-primary/30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Every State</option>
            {Object.entries(STATUSES).map(([key, {label}]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select 
            className="flex-1 sm:flex-none h-10 rounded-xl border border-border bg-background px-4 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer hover:border-primary/30"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Personnel</option>
            <option value="unassigned">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board - Mobile Responsive with Snap */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 snap-x lg:snap-none">
          {columns.map(statusKey => {
            if (statusFilter !== "all" && statusFilter !== statusKey) return null;
            
            const columnTasks = tasks.filter(t => {
              const matchesStatus = t.status === statusKey;
              const matchesAssignee = assigneeFilter === "all" 
                || (assigneeFilter === "unassigned" && !t.assignee_id)
                || t.assignee_id === assigneeFilter;
              return matchesStatus && matchesAssignee;
            });
            
            return (
              <div key={statusKey} className="flex flex-col min-w-[85vw] sm:min-w-[350px] lg:min-w-0 snap-center">
                <div className="flex items-center justify-between mb-5 px-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_8px] transition-all duration-500", STATUSES[statusKey].color.split(" ")[1], STATUSES[statusKey].glow)} />
                    <h3 className="font-black text-xs uppercase tracking-[0.15em] opacity-70">
                      {STATUSES[statusKey].label}
                    </h3>
                  </div>
                  <div className="h-6 w-6 rounded-lg bg-secondary/50 flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border/50">
                    {columnTasks.length}
                  </div>
                </div>
                
                <Droppable droppableId={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 flex flex-col gap-4 p-3 rounded-[2rem] border-2 transition-all duration-500 min-h-[500px]",
                        snapshot.isDraggingOver 
                          ? "bg-primary/5 border-primary/20 ring-4 ring-primary/5 shadow-2xl" 
                          : "bg-secondary/20 dark:bg-zinc-900/40 border-border/10 shadow-sm"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {columnTasks.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-[1.5rem] py-16 px-4"
                          >
                            <Layout className="h-8 w-8 text-muted-foreground/10 mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">No Active Tasks</p>
                          </motion.div>
                        ) : (
                          columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  layout
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "bg-card group p-6 rounded-[1.75rem] border border-border/50 transition-all duration-500 cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
                                    snapshot.isDragging ? "shadow-2xl rotate-3 scale-105 border-primary ring-8 ring-primary/5 z-50 bg-card/90" : ""
                                  )}
                                  onClick={() => openTaskModal(task)}
                                >
                                  <div className="flex justify-between items-start mb-5">
                                    <Badge className={cn("text-[9px] uppercase font-black px-2.5 py-1 rounded-full shadow-sm border-none", PRIORITIES[task.priority].color)}>
                                      {task.priority}
                                    </Badge>
                                    
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} 
                                      className="lg:opacity-0 group-hover:opacity-100 transition-all text-muted-foreground/30 hover:text-destructive p-2 rounded-xl hover:bg-destructive/10 -mt-1 -mr-1"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  
                                  <h4 className="font-bold text-lg leading-tight tracking-tight mb-3 group-hover:text-primary transition-colors duration-300">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-6 leading-relaxed font-medium">{task.description}</p>
                                  )}
                                  
                                  <div className="flex items-center justify-between pt-5 border-t border-border/20">
                                    <div className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                      {task.due_date ? (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-lg">
                                          <CalendarDays className="h-3 w-3 opacity-50" />
                                          <span>{format(parseISO(task.due_date), "MMM d")}</span>
                                        </div>
                                      ) : (
                                        <span className="opacity-20 italic">Unscheduled</span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center">
                                      {task.assignee_id ? (
                                        <div className="relative group/avatar">
                                          <div className="h-9 w-9 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-[11px] font-black text-primary transition-all duration-500 group-hover/avatar:rounded-xl group-hover/avatar:bg-primary group-hover/avatar:text-primary-foreground group-hover/avatar:scale-110">
                                            {getInitials(getAssigneeName(task.assignee_id))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="h-9 w-9 rounded-2xl bg-muted/30 border border-dashed border-border flex items-center justify-center text-muted-foreground/20">
                                          <UserIcon className="h-4 w-4" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={editingTask ? "Sync Task" : "Deploy Task"}
        className="max-w-md"
      >
        <form onSubmit={handleSaveTask} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest opacity-60">Objective</Label>
            <Input
              id="title" required
              placeholder="Primary task title..."
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="h-12 rounded-xl focus:ring-4 focus:ring-primary/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest opacity-60">Context</Label>
            <textarea
              id="description"
              placeholder="What are the key details?"
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all backdrop-blur-md"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest opacity-60">State</Label>
              <select 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all backdrop-blur-md"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest opacity-60">Priority</Label>
              <select 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all backdrop-blur-md"
                value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low Intensity</option>
                <option value="medium">Medium Priority</option>
                <option value="high">Critical Path</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest opacity-60">Owner</Label>
              <select 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all backdrop-blur-md"
                value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})}
              >
                <option value="">No Stakeholder</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest opacity-60">Deadline</Label>
              <Input
                type="date"
                className="h-12 rounded-xl focus:ring-4 focus:ring-primary/10"
                value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl h-12" onClick={() => setIsTaskModalOpen(false)}>
              Discard
            </Button>
            <Button type="submit" className="flex-[2] rounded-xl h-12 font-bold shadow-xl shadow-primary/20" isLoading={isSubmitting}>
              {editingTask ? "Synchronize" : "Deploy Objectives"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
