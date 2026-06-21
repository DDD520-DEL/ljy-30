import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { Clock, Eye, EyeOff, Users, Check, ChevronRight } from 'lucide-react';
import { formatCountdown, formatDateTime } from '@/utils/date';
import type { Poll } from '@/types';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const {
    roommates,
    currentHouseId,
    announcementRoommateId,
    getVotesByPollId,
    setSelectedPoll,
    setShowPollDetailModal,
    votePoll,
    getVoteByPollAndRoommate,
  } = useBorrowStore();

  const [, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const resolvedRoommateId = useMemo(() => {
    if (announcementRoommateId && currentRoommates.some((r) => r.id === announcementRoommateId)) {
      return announcementRoommateId;
    }
    return currentRoommates[0]?.id || '';
  }, [announcementRoommateId, currentRoommates]);

  const votes = useMemo(() => getVotesByPollId(poll.id), [poll.id, getVotesByPollId]);
  const myVote = useMemo(
    () => (resolvedRoommateId ? getVoteByPollAndRoommate(poll.id, resolvedRoommateId) : undefined),
    [poll.id, resolvedRoommateId, getVoteByPollAndRoommate]
  );

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(myVote?.optionIds || []);

  useEffect(() => {
    setSelectedOptionIds(myVote?.optionIds || []);
  }, [myVote]);

  const totalVotes = votes.length;
  const participantCount = currentRoommates.length;

  const optionVoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    poll.options.forEach((opt) => (counts[opt.id] = 0));
    votes.forEach((vote) => {
      vote.optionIds.forEach((oid) => {
        counts[oid] = (counts[oid] || 0) + 1;
      });
    });
    return counts;
  }, [poll.options, votes]);

  const maxVotes = Math.max(...Object.values(optionVoteCounts), 1);
  const countdown = formatCountdown(poll.endAt);
  const isEnded = poll.status !== 'active' || countdown.isEnded;

  const handleOptionClick = (optionId: string) => {
    if (isEnded) return;
    if (poll.type === 'single') {
      setSelectedOptionIds([optionId]);
    } else {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    }
  };

  const handleVote = () => {
    if (!resolvedRoommateId || selectedOptionIds.length === 0 || isEnded) return;
    const roommate = currentRoommates.find((r) => r.id === resolvedRoommateId);
    if (!roommate) return;
    votePoll(poll.id, selectedOptionIds, roommate.id, roommate.name, roommate.avatar);
  };

  const statusBadge = () => {
    if (poll.status === 'archived') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
          📦 已归档
        </span>
      );
    }
    if (isEnded) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success-50 text-success-600">
          ✅ 已结束
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${countdown.isUrgent ? 'bg-danger-50 text-danger-600' : 'bg-primary-50 text-primary-600'}`}>
        🗳️ 进行中
      </span>
    );
  };

  const handleOpenDetail = () => {
    setSelectedPoll(poll);
    setShowPollDetailModal(true);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-info-100 to-info-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            {poll.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {statusBadge()}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                {poll.type === 'single' ? '单选' : '多选'}
              </span>
              {poll.visibility === 'anonymous' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                  <EyeOff className="w-3 h-3" />
                  匿名
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                  <Eye className="w-3 h-3" />
                  实名
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-base truncate">{poll.title}</h3>
            {poll.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{poll.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-1">
          <span>{poll.creatorAvatar}</span>
          <span>{poll.creatorName} 发起</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{totalVotes}/{participantCount}人已投票</span>
        </div>
        <div className={`flex items-center gap-1 ${countdown.isUrgent && !isEnded ? 'text-danger-500 font-medium' : ''}`}>
          <Clock className="w-3 h-3" />
          {isEnded ? (
            <span>截止：{formatDateTime(poll.endAt)}</span>
          ) : (
            <span>剩余 {countdown.text}</span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {poll.options.slice(0, 3).map((option) => {
          const count = optionVoteCounts[option.id] || 0;
          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isSelected = selectedOptionIds.includes(option.id);
          const isLeading = count === maxVotes && count > 0;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={isEnded}
              className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all ${
                isEnded
                  ? 'cursor-default bg-gray-50'
                  : isSelected
                  ? 'ring-2 ring-info-400 bg-info-50'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {totalVotes > 0 && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isLeading ? 'bg-info-100' : 'bg-gray-100'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {poll.type === 'single' ? (
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-info-500 bg-info-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  ) : (
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-info-500 bg-info-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {option.emoji && <span className="mr-1">{option.emoji}</span>}
                    {option.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-sm font-semibold ${isLeading && count > 0 ? 'text-info-600' : 'text-gray-500'}`}>
                    {totalVotes > 0 ? `${Math.round(percentage)}%` : ''}
                  </span>
                  {totalVotes > 0 && (
                    <span className="text-xs text-gray-400">({count}票)</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {poll.options.length > 3 && (
          <button
            onClick={handleOpenDetail}
            className="w-full text-xs text-info-500 text-center py-1 hover:text-info-600"
          >
            还有 {poll.options.length - 3} 个选项，点击查看全部 →
          </button>
        )}
      </div>

      {!isEnded ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleVote}
            disabled={selectedOptionIds.length === 0 || !resolvedRoommateId}
            className="flex-1 py-2.5 bg-info-500 text-white rounded-xl text-sm font-medium hover:bg-info-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {myVote ? '修改投票' : '投票'}
          </button>
          <button
            onClick={handleOpenDetail}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleOpenDetail}
          className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
        >
          查看结果详情
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
