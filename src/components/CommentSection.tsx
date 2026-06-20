import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { Comment } from '@/types';
import { formatCommentTime } from '@/utils/date';
import { Send, Trash2, ChevronDown, MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  recordId: string;
}

export function CommentSection({ recordId }: CommentSectionProps) {
  const { addComment, deleteComment, getCommentsByRecordId, roommates, currentHouseId } = useBorrowStore();

  const [content, setContent] = useState('');
  const [selectedRoommateId, setSelectedRoommateId] = useState('');
  const [showRoommatePicker, setShowRoommatePicker] = useState(false);

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const comments = getCommentsByRecordId(recordId);
  const selectedRoommate = currentRoommates.find((r) => r.id === selectedRoommateId);

  const handleSubmit = () => {
    if (!content.trim() || !selectedRoommateId) return;

    const roommate = currentRoommates.find((r) => r.id === selectedRoommateId);
    if (!roommate) return;

    addComment({
      recordId,
      roommateId: selectedRoommateId,
      roommateName: roommate.name,
      roommateAvatar: roommate.avatar,
      content: content.trim(),
    });

    setContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('确定要删除这条评论吗？')) {
      deleteComment(commentId);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary-500" />
        评论互动
        <span className="text-sm font-normal text-gray-500">({comments.length})</span>
      </h3>

      <div className="mb-6">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择身份
          </label>
          <div className="relative">
            <button
              onClick={() => setShowRoommatePicker(!showRoommatePicker)}
              className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              {selectedRoommate ? (
                <>
                  <span className="text-2xl">{selectedRoommate.avatar}</span>
                  <span className="text-gray-800">{selectedRoommate.name}</span>
                </>
              ) : (
                <span className="text-gray-400">请选择评论身份</span>
              )}
              <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
            </button>

            {showRoommatePicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                {currentRoommates.map((roommate) => (
                  <button
                    key={roommate.id}
                    onClick={() => {
                      setSelectedRoommateId(roommate.id);
                      setShowRoommatePicker(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                      selectedRoommateId === roommate.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-2xl">{roommate.avatar}</span>
                    <span className="text-gray-800">{roommate.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的评论..."
              rows={2}
              className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || !selectedRoommateId}
            className="px-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500">暂无评论，快来抢沙发吧~</p>
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3 animate-fade-in">
              <div className="text-3xl flex-shrink-0">{comment.roommateAvatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{comment.roommateName}</span>
                  <span className="text-xs text-gray-400">{formatCommentTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 text-sm break-words">{comment.content}</p>
              </div>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
                title="删除评论"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
