import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Plus, FolderPlus, Loader2, LayoutGrid, Calendar, MoreVertical, Layers, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import mockApi from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { toast } from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mockApi.getProjects(user.id);
      if (res.status === 200) {
        setProjects(res.data.projects);
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Project name is required");
    
    setIsSubmitting(true);
    try {
      const res = await mockApi.createProject(user.id, { name, description });
      if (res.status === 201) {
        // Fetch projects again to get accurate counts
        loadProjects();
        toast.success("Project created successfully");
        setIsModalOpen(false);
        setName("");
        setDescription("");
      }
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Gathering workspace details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Your Projects</h2>
          <p className="text-muted-foreground mt-1 text-lg">Manage your team&apos;s focus and velocity.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all font-bold">
          <Plus className="mr-2 h-5 w-5" /> Create Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-20 text-center rounded-[2.5rem] border-2 border-dashed border-border/60 bg-secondary/20 dark:bg-zinc-900/40 backdrop-blur-sm"
        >
          <div className="h-24 w-24 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 ring-4 ring-primary/5">
            <FolderPlus className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">No active projects</h3>
          <p className="text-muted-foreground max-w-sm mt-3 mb-8 leading-relaxed">
            Every great initiative begins with a single workspace. Create yours now and start collaborating.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="rounded-2xl h-14 px-8 font-bold">Launch First Project</Button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => {
            const progress = project.total_tasks > 0 
              ? Math.round((project.completed_tasks / project.total_tasks) * 100) 
              : 0;

            return (
              <motion.div key={project.id} variants={itemVariants}>
                <Link to={`/projects/${project.id}`} className="group block h-full">
                  <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:ring-2 hover:ring-primary/20 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                          <Layers className="h-6 w-6" />
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                           <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                      <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed mt-2 text-muted-foreground/80">
                        {project.description || "No description provided for this workspace."}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-8 pt-4 border-t border-border/10 mx-4">
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground flex items-center gap-2">
                             <CheckCircle2 className="h-3 w-3" /> Progress
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                          />
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                          </div>
                          <div className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">
                            {project.total_tasks} Tasks
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start New Project" className="max-w-md">
        <form onSubmit={handleCreateProject} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="e.g. Marketing Q4, Design System"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Project Context</Label>
            <textarea
              id="desc"
              placeholder="Briefly describe the objective of this space..."
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl h-12" onClick={() => setIsModalOpen(false)}>
              Discard
            </Button>
            <Button type="submit" className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-primary/20" isLoading={isSubmitting}>
              Launch Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
