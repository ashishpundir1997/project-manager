import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function Team() {
  const { members, loading, error, fetchMembers, createMember } = useTeamStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreate = async () => {
    if (!memberName.trim()) {
      toast.error('Member name is required');
      return;
    }
    try {
      await createMember(memberName);
      setMemberName('');
      setIsCreateOpen(false);
      toast.success('Team member added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add team member');
    }
  };

  const getCapacityColor = (taskCount: number) => {
    if (taskCount <= 3) return 'bg-green-500';
    if (taskCount <= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCapacityPercentage = (taskCount: number) => {
    // Max capacity is considered 10 tasks
    return Math.min((taskCount / 10) * 100, 100);
  };

  const getCapacityText = (taskCount: number) => {
    if (taskCount <= 3) return 'Low';
    if (taskCount <= 6) return 'Medium';
    return 'High';
  };

  if (loading && members.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No team members yet. Add your first member!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const taskCount = member.taskCount ?? 0; // Ensure taskCount is always a number
              const capacityColor = getCapacityColor(taskCount);
              const capacityPercentage = getCapacityPercentage(taskCount);
              const capacityText = getCapacityText(taskCount);

              return (
                <Card key={member._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Assigned Tasks</span>
                          <span className="font-semibold">{taskCount}</span>
                        </div>
                        <div className="relative">
                          <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full ${capacityColor} rounded-full transition-all`}
                              style={{ width: `${capacityPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className={`font-medium ${
                            taskCount <= 3
                              ? 'text-green-600'
                              : taskCount <= 6
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}>
                            {capacityText} Capacity
                          </span>
                        </div>
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
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Enter the name of the new team member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Member name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

