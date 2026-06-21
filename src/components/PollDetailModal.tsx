import { useState, useEffect, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { X, Check, Clock, Eye, EyeOff, Users, Trash2, Archive, StopCircle, Trophy, Crown } from 'lucide-react';
import { formatCountdown, formatDateTime, formatCommentTime } from '@/utils/date';
import type { PollVote } from '@/types';

interface PollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PollDetailModal({ isOpen, onClose }: PollDetailModalProps) {
  const {
    selectedPoll,
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    getVotesByPollId,
    getVoteByPollAndRoommate,
    votePoll,
    cancelVote,
    endPoll,
    archivePoll,
    deletePoll,
    setShowPollDetailModal,
    setSelectedPoll,
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

  useEffect(() => {
    if (!announcementRoommateId || !currentRoommates.some((r) => r.id === announcementRoommateId)) {
      if (currentRoommates.length > 0 && announcementRoommateId !== currentRoommates[0].id) {
        setAnnouncementRoommateId(currentRoommates[0].id);
      }
    }
  }, [currentRoommates, announcementRoommateId, setAnnouncementRoommateId]);

  const votes = useMemo(
    () => (selectedPoll ? getVotesByPollId(selectedPoll.id) : []),
    [selectedPoll, getVotesByPollId]
  );

  const myVote = useMemo(
    () =>
      selectedPoll && resolvedRoommateId
        ? getVoteByPollAndRoommate(selectedPoll.id, resolvedRoommateId)
        : undefined,
    [selectedPoll, resolvedRoommateId, getVoteByPollAndRoommate]
  );

  const optionVoteCounts = useMemo(() => {
    if (!selectedPoll) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    selectedPoll.options.forEach((opt) => (counts[opt.id] = 0));
    votes.forEach((vote) => {
      vote.optionIds.forEach((oid) => {
        counts[oid] = (counts[oid] || 0) + 1;
      });
    });
    return counts;
  }, [selectedPoll, votes]);

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(myVote?.optionIds || []);

  useEffect(() => {
    setSelectedOptionIds(myVote?.optionIds || []);
  }, [myVote?.optionIds, selectedPoll?.id]);

  if (!isOpen || !selectedPoll) return null;

  const poll = selectedPoll;
  const totalVotes = votes.length;
  const participantCount = currentRoommates.length;

  const maxVotes = Math.max(...Object.values(optionVoteCounts), 1);

  const getVotersByOption = (optionId: string): PollVote[] => {
    return votes.filter((v) => v.optionIds.includes(optionId));
  };

  const countdown = formatCountdown(poll.endAt);
  const isEnded = poll.status !== 'active' || countdown.isEnded;
  const isCreator = resolvedRoommateId === poll.creatorId;

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

  const handleCancelVote = () => {
    if (!resolvedRoommateId) return;
    cancelVote(poll.id, resolvedRoommateId);
    setSelectedOptionIds([]);
  };

  const handleEndPoll = () => {
    endPoll(poll.id);
  };

  const handleArchive = () => {
    archivePoll(poll.id);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个投票吗？此操作不可撤销。')) {
      deletePoll(poll.id);
      setSelectedPoll(null);
      setShowPollDetailModal(false);
    }
  };

  const sortedOptions = [...poll.options].sort(
    (a, b) => optionVoteCounts[b.id] - optionVoteCounts[a.id]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {poll.emoji}
            投票详情
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-info-100 to-info-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {poll.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {poll.status === 'archived' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">
                      📦 已归档
                    </span>
                  ) : isEnded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-success-50 text-success-600 font-medium">
                      ✅ 已结束
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        countdown.isUrgent
                          ? 'bg-danger-50 text-danger-600'
                          : 'bg-primary-50 text-primary-600'
                      }`}
                    >
                      🗳️ 进行中
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                    {poll.type === 'single' ? '单选' : '多选'}
                  </span>
                  {poll.visibility === 'anonymous' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                      <EyeOff className="w-3 h-3" />
                      匿名
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
                      <Eye className="w-3 h-3" />
                      实名
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-1 leading-tight">{poll.title}</h1>
                {poll.description && (
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {poll.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 bg-gray-50 rounded-2xl mb-5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{poll.creatorAvatar}</span>
                <span>
                  <span className="text-gray-700 font-medium">{poll.creatorName}</span> 发起
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <span className="text-gray-700 font-medium">{totalVotes}</span>/
                  {participantCount}人已投票
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {isEnded ? (
                  <span>
                    截止于 {formatDateTime(poll.endAt)}
                  </span>
                ) : (
                  <span className={countdown.isUrgent ? 'text-danger-600 font-medium' : ''}>
                    剩余 {countdown.text}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span>创建于 {formatCommentTime(poll.createdAt)}</span>
              </div>
            </div>

            {totalVotes > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-warning-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    领先：{sortedOptions[0]?.text || '-'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {totalVotes > 0
                      ? `(${Math.round((optionVoteCounts[sortedOptions[0]?.id || ''] / totalVotes) * 100)}%)`
                      : ''}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-5">
              {sortedOptions.map((option, idx) => {
                const count = optionVoteCounts[option.id] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isSelected = selectedOptionIds.includes(option.id);
                const isLeading = count === maxVotes && count > 0;
                const voters = getVotersByOption(option.id);

                return (
                  <div
                    key={option.id}
                    className={`relative overflow-hidden rounded-2xl transition-all ${
                      isEnded
                        ? 'bg-gray-50 cursor-default'
                        : isSelected
                        ? 'ring-2 ring-info-400 bg-info-50 cursor-pointer'
                        : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                    }`}
                    onClick={() => handleOptionClick(option.id)}
                  >
                    {totalVotes > 0 && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                          isLeading ? 'bg-gradient-to-r from-warning-100 to-warning-50' : 'bg-gray-100'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {isLeading && totalVotes > 0 && (
                            <div className="w-7 h-7 bg-gradient-to-br from-warning-400 to-warning-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {!isLeading && (
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0 shadow-sm">
                              {idx + 1}
                            </div>
                          )}
                          {!isEnded && (
                            poll.type === 'single' ? (
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-info-500 bg-info-500'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                )}
                              </div>
                            ) : (
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-info-500 bg-info-500'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                )}
                              </div>
                            )
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 leading-snug">
                              {option.emoji && <span className="mr-1">{option.emoji}</span>}
                              {option.text}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-xl font-bold ${
                              isLeading && count > 0 ? 'text-warning-600' : 'text-gray-700'
                            }`}
                          >
                            {totalVotes > 0 ? `${Math.round(percentage)}%` : '0%'}
                          </div>
                          <div className="text-xs text-gray-400">{count}票</div>
                        </div>
                      </div>

                      {voters.length > 0 && poll.visibility === 'public' && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200/50">
                          {voters.map((voter) => (
                            <div
                              key={voter.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-xs text-gray-600 shadow-sm"
                              title={`${voter.roommateName} · ${formatCommentTime(voter.createdAt)}`}
                            >
                              <span className="text-sm">{voter.roommateAvatar}</span>
                              <span>{voter.roommateName}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {voters.length > 0 && poll.visibility === 'anonymous' && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-400">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>匿名投票，{voters.length}人投了此项</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentRoommates.length > 0 && (
              <div className="mb-5 p-4 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500 mb-2 font-medium">投票参与情况</div>
                <div className="flex flex-wrap gap-2">
                  {currentRoommates.map((roommate) => {
                    const voted = votes.some((v) => v.roommateId === roommate.id);
                    return (
                      <div
                        key={roommate.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                          voted
                            ? 'bg-success-100 text-success-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <span className="text-sm">{roommate.avatar}</span>
                        <span>{roommate.name}</span>
                        {voted ? (
                          <Check className="w-3 h-3" strokeWidth={3} />
                        ) : (
                          <span className="text-[10px]">未投</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex-shrink-0 space-y-2">
          {!isEnded ? (
            <>
              {currentRoommates.length > 1 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">我是</div>
                  <div className="flex gap-2 flex-wrap">
                    {currentRoommates.map((roommate) => (
                      <button
                        key={roommate.id}
                        onClick={() => setAnnouncementRoommateId(roommate.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                          resolvedRoommateId === roommate.id
                            ? 'bg-info-100 text-info-700 ring-2 ring-info-300 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-sm">{roommate.avatar}</span>
                        <span>{roommate.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {myVote && (
                  <button
                    onClick={handleCancelVote}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    撤回
                  </button>
                )}
                <button
                  onClick={handleVote}
                  disabled={selectedOptionIds.length === 0 || !resolvedRoommateId}
                  className="flex-1 py-3 bg-info-500 text-white rounded-xl text-sm font-semibold hover:bg-info-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {myVote ? '修改投票' : '确认投票'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {isCreator && poll.status === 'ended' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleArchive}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" />
                    归档投票
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-3 bg-danger-50 text-danger-600 rounded-xl text-sm font-medium hover:bg-danger-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {isCreator && poll.status === 'archived' && (
                <button
                  onClick={handleDelete}
                  className="w-full py-3 bg-danger-50 text-danger-600 rounded-xl text-sm font-medium hover:bg-danger-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  删除投票
                </button>
              )}
              {isCreator && poll.status === 'active' && (
                <button
                  onClick={handleEndPoll}
                  className="w-full py-3 bg-warning-500 text-white rounded-xl text-sm font-medium hover:bg-warning-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <StopCircle className="w-4 h-4" />
                  提前结束投票
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
