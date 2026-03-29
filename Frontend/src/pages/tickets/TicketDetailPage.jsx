import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  SendIcon,
  CheckCircle2Icon } from
'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { mockTickets, mockUsers } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
  {
    id: 1,
    text: 'We have received the ticket and assigned a technician.',
    author: 'System',
    time: '1 day ago',
    isTech: true
  }]
  );
  const ticket = mockTickets.find((t) => t.id === id);
  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Ticket not found
        </h2>
        <Button className="mt-4" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>);

  }
  const creator = Object.values(mockUsers).find(
    (u) => u.id === ticket.createdBy
  );
  const assignee = ticket.assignedTo ?
  Object.values(mockUsers).find((u) => u.id === ticket.assignedTo) :
  null;
  const handleAddComment = () => {
    if (!comment.trim()) return;
    setComments([
    ...comments,
    {
      id: Date.now(),
      text: comment,
      author: user?.name || 'You',
      time: 'Just now',
      isTech: user?.role !== 'USER'
    }]
    );
    setComment('');
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tickets')}
          className="px-2">
          
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {ticket.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Ticket #{ticket.id.toUpperCase()}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Created {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Issue Details
              </h2>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                  
                  <AlertTriangleIcon className="w-3 h-3" />
                  {ticket.priority}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    {ticket.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Category
                  </p>
                  <p className="text-slate-900 dark:text-white text-sm">
                    {ticket.category}
                  </p>
                </div>
              </div>

              {/* Mock Image Gallery */}
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Attached Evidence
                </p>
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                    No images
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Comments & Activity
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {comments.map((c) =>
                <div key={c.id} className="flex gap-4">
                    <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.isTech ? 'bg-brand-blue text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900 dark:text-white">
                          {c.author}
                        </span>
                        {c.isTech &&
                      <Badge
                        variant="info"
                        className="text-[10px] px-1.5 py-0">
                        
                            Staff
                          </Badge>
                      }
                        <span className="text-xs text-slate-500">{c.time}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg rounded-tl-none border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                        {c.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full pl-3 pr-12 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm text-slate-900 dark:text-white resize-none" />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 bottom-2 h-6 w-6 p-0 text-brand-purple hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    onClick={handleAddComment}
                    disabled={!comment.trim()}>
                    
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                People
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Reporter
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={creator?.avatar}
                    alt={creator?.name}
                    className="w-8 h-8 rounded-full" />
                  
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {creator?.name}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Assignee
                </p>
                {assignee ?
                <div className="flex items-center gap-3">
                    <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-8 h-8 rounded-full" />
                  
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {assignee.name}
                    </span>
                  </div> :

                <p className="text-sm text-slate-500 italic">Unassigned</p>
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Status Timeline
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {ticket.status === 'RESOLVED' &&
                <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                      <CheckCircle2Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Resolved
                      </p>
                      <p className="text-xs text-slate-500">Today</p>
                    </div>
                  </div>
                }

                {(ticket.status === 'IN_PROGRESS' ||
                ticket.status === 'RESOLVED') &&
                <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        In Progress
                      </p>
                      <p className="text-xs text-slate-500">Yesterday</p>
                    </div>
                  </div>
                }

                <div className="relative flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Ticket Created
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}
