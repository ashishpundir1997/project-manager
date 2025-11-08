import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle2, Circle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { members, fetchMembers } = useTeamStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ id: string; name: string; assignedTo?: string } | null>(null);
  const [taskName, setTaskName] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('');

  const project = projects.find((p) => p._id === id);
  const projectTasks = id ? tasks[id] || [] : [];

  useEffect(() => {
    if (id) {
      fetchProjects();
      fetchTasks(id);
      fetchMembers();
    }
  }, [id, fetchProjects, fetchTasks, fetchMembers]);

  const handleCreate = async () => {
    if (!id || !taskName.trim()) {
      toast.error('Task name is required');
      return;
    }
    try {
      await createTask(id, taskName, selectedMember || undefined);
      setTaskName('');
      setSelectedMember('');
      setIsCreateOpen(false);
      toast.success('Task created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleEdit = async () => {
    if (!editingTask || !taskName.trim()) {
      toast.error('Task name is required');
      return;
    }
    try {
      await updateTask(editingTask.id, { 
        name: taskName,
        assignedTo: selectedMember || undefined
      });
      setTaskName('');
      setSelectedMember('');
      setEditingTask(null);
      setIsEditOpen(false);
      toast.success('Task updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
      toast.success(completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTaskId) return;
    try {
      await deleteTask(deletingTaskId);
      toast.success('Task deleted successfully');
      setDeletingTaskId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleAssignTask = async (taskId: string, memberId: string) => {
    try {
      await updateTask(taskId, { assignedTo: memberId || undefined });
      toast.success('Task assigned successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign task');
    }
  };

  const openEditDialog = (task: { _id: string; name: string; assignedTo?: string | { _id: string; name: string } | null }) => {
    const assignedToId = task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo !== null
      ? task.assignedTo._id
      : (task.assignedTo || '');
    setEditingTask({ id: task._id, name: task.name, assignedTo: assignedToId || undefined });
    setTaskName(task.name);
    setSelectedMember(assignedToId || '');
    setIsEditOpen(true);
  };

  const getAssignedMemberName = (assignedTo?: string | { _id: string; name: string } | null) => {
    if (!assignedTo || assignedTo === null) return null;
    if (typeof assignedTo === 'object' && assignedTo !== null && '_id' in assignedTo) {
      return assignedTo.name;
    }
    const member = members.find(m => m._id === assignedTo);
    return member?.name || null;
  };

  if (!project) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.status}</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading && projectTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading tasks...
            </CardContent>
          </Card>
        ) : projectTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No tasks yet. Create your first task!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projectTasks.filter(task => task && task._id).map((task) => {
              const assignedMemberName = getAssignedMemberName(task.assignedTo);
              return (
                <Card key={task._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleComplete(task._id, task.completed)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`text-lg ${
                            task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {task.name}
                        </p>
                        {assignedMemberName && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <User className="h-3 w-3" />
                            <span>{assignedMemberName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={
                            task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo !== null
                              ? task.assignedTo._id
                              : (task.assignedTo || '')
                          }
                          onChange={(e) => handleAssignTask(task._id, e.target.value)}
                          className="w-40"
                        >
                          <option value="">Unassigned</option>
                          {members.filter(m => m && m._id).map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(task._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent onClose={() => setIsCreateOpen(false)}>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Enter a name for your new task and optionally assign it to a team member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign to Team Member (Optional)
                </label>
                <Select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.filter(m => m && m._id).map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setTaskName('');
                  setSelectedMember('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent onClose={() => setIsEditOpen(false)}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update the task name and assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                autoFocus
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign to Team Member (Optional)
                </label>
                <Select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.filter(m => m && m._id).map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  setTaskName('');
                  setSelectedMember('');
                  setEditingTask(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
