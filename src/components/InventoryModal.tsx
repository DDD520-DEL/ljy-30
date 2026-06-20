import { useState, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { InventoryItem } from '@/types';
import { X, Plus, Edit2, Trash2, Package, AlertTriangle, Check, PlusCircle, MinusCircle } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditMode = 'list' | 'add' | 'edit';

export function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const {
    inventory,
    currentHouseId,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    restockInventory,
    getLowStockItems,
    getCurrentHouse,
  } = useBorrowStore();
  const currentHouse = getCurrentHouse();

  const currentInventory = useMemo(
    () => inventory.filter((i) => i.houseId === currentHouseId),
    [inventory, currentHouseId]
  );

  const [editMode, setEditMode] = useState<EditMode>('list');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    emoji: '📦',
    isConsumable: false,
    totalQuantity: 10,
    threshold: 5,
    unit: '个',
  });

  const lowStockItems = getLowStockItems();

  const resetForm = () => {
    setFormData({
      name: '',
      emoji: '📦',
      isConsumable: false,
      totalQuantity: 10,
      threshold: 5,
      unit: '个',
    });
    setEditingItem(null);
    setRestockItemId(null);
    setRestockAmount(1);
  };

  const handleAdd = () => {
    resetForm();
    setEditMode('add');
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      emoji: item.emoji,
      isConsumable: item.isConsumable,
      totalQuantity: item.totalQuantity,
      threshold: item.threshold,
      unit: item.unit,
    });
    setEditMode('edit');
  };

  const willAdjustCurrent = editMode === 'edit' && editingItem && formData.totalQuantity < editingItem.currentQuantity;

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    let confirmed = true;
    if (willAdjustCurrent && editingItem) {
      confirmed = window.confirm(
        `总数量（${formData.totalQuantity}${editingItem.unit}）小于当前库存（${editingItem.currentQuantity}${editingItem.unit}），\n` +
        `保存后当前库存将自动调整为 ${formData.totalQuantity}${editingItem.unit}。\n\n是否继续保存？`
      );
    }

    if (!confirmed) return;

    if (editMode === 'add') {
      addInventoryItem({
        name: formData.name.trim(),
        emoji: formData.emoji,
        isConsumable: formData.isConsumable,
        totalQuantity: formData.totalQuantity,
        threshold: formData.threshold,
        unit: formData.unit,
      });
    } else if (editMode === 'edit' && editingItem) {
      updateInventoryItem(editingItem.id, {
        name: formData.name.trim(),
        emoji: formData.emoji,
        isConsumable: formData.isConsumable,
        totalQuantity: formData.totalQuantity,
        threshold: formData.threshold,
        unit: formData.unit,
      });
    }

    setEditMode('list');
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      deleteInventoryItem(id);
    }
  };

  const handleRestock = (itemId: string) => {
    setRestockItemId(itemId);
    setRestockAmount(1);
  };

  const confirmRestock = () => {
    if (restockItemId && restockAmount > 0) {
      restockInventory(restockItemId, restockAmount);
      setRestockItemId(null);
      setRestockAmount(1);
    }
  };

  const isLowStock = (item: InventoryItem) => {
    return item.currentQuantity <= item.threshold;
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.currentQuantity <= 0) return 'text-danger-500';
    if (isLowStock(item)) return 'text-warning-500';
    return 'text-success-500';
  };

  const getStockBarColor = (item: InventoryItem) => {
    const ratio = item.totalQuantity > 0 ? item.currentQuantity / item.totalQuantity : 0;
    if (ratio <= 0) return 'bg-danger-400';
    if (ratio <= 0.3) return 'bg-danger-400';
    if (ratio <= 0.5) return 'bg-warning-400';
    return 'bg-success-400';
  };

  const emojiOptions = ['📦', '🧴', '🧻', '🍿', '🥤', '🔌', '☂️', '📚', '🎧', '🔋', '✂️', '🖱️', '⌨️', '👕', '👟', '💨'];
  const unitOptions = ['个', '瓶', '包', '袋', '把', '件', '双', '本', '台'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (editMode === 'list') {
            onClose();
          } else {
            setEditMode('list');
            resetForm();
          }
        }}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {editMode === 'list' ? (
              <>
                <span className="text-2xl">📦</span>
                物品库存
                {currentHouse && (
                  <span className="text-sm font-normal text-gray-500">
                    · {currentHouse.emoji} {currentHouse.name}
                  </span>
                )}
              </>
            ) : editMode === 'add' ? (
              <>
                <span className="text-2xl">➕</span>
                添加物品
              </>
            ) : (
              <>
                <span className="text-2xl">✏️</span>
                编辑物品
              </>
            )}
          </h2>
          <button
            onClick={() => {
              if (editMode === 'list') {
                onClose();
              } else {
                setEditMode('list');
                resetForm();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {editMode === 'list' && (
          <>
            {lowStockItems.length > 0 && (
              <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-xl flex-shrink-0">
                <div className="flex items-center gap-2 text-warning-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>有 {lowStockItems.length} 件物品库存不足，需要补货</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              {currentInventory.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-gray-500">还没有库存物品</p>
                  <p className="text-gray-400 text-sm mt-1">点击下方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {currentInventory.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                        isLowStock(item) ? 'border-warning-300 bg-warning-50/50' : 'border-gray-100'
                      }`}
                    >
                      {restockItemId === item.id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">补货 {item.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => setRestockAmount(Math.max(1, restockAmount - 1))}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                <MinusCircle className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-12 text-center font-bold text-lg">{restockAmount}</span>
                              <button
                                onClick={() => setRestockAmount(restockAmount + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                <PlusCircle className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="text-gray-500 text-sm">{item.unit}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRestockItemId(null)}
                              className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                            >
                              取消
                            </button>
                            <button
                              onClick={confirmRestock}
                              className="px-3 py-1.5 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600"
                            >
                              确认
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="text-4xl flex-shrink-0">{item.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                                {item.isConsumable && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full flex-shrink-0">
                                    消耗品
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-lg font-bold ${getStockStatusColor(item)}`}>
                                  {item.currentQuantity}
                                </span>
                                <span className="text-gray-400 text-sm">/ {item.totalQuantity}</span>
                                <span className="text-gray-500 text-sm">{item.unit}</span>
                                {isLowStock(item) && (
                                  <span className="text-xs text-warning-600 bg-warning-100 px-2 py-0.5 rounded-full">
                                    库存不足
                                  </span>
                                )}
                              </div>

                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div
                                  className={`h-full ${getStockBarColor(item)} transition-all duration-300`}
                                  style={{
                                    width: `${Math.min(100, item.totalQuantity > 0 ? (item.currentQuantity / item.totalQuantity) * 100 : 0)}%`,
                                  }}
                                />
                              </div>

                              <p className="text-xs text-gray-400">
                                安全阈值: {item.threshold} {item.unit}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleRestock(item.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-success-50 text-success-600 rounded-lg hover:bg-success-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              补货
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              删除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              className="mt-4 w-full py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              添加物品
            </button>
          </>
        )}

        {(editMode === 'add' || editMode === 'edit') && (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="space-y-5 py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物品名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入物品名称"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择图标
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`p-2 rounded-xl text-2xl transition-all ${
                        formData.emoji === emoji
                          ? 'bg-primary-100 ring-2 ring-primary-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物品类型
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, isConsumable: false })}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      !formData.isConsumable
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📦 普通物品
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, isConsumable: true })}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      formData.isConsumable
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🧪 消耗品
                  </button>
                </div>
              </div>

              {editMode === 'edit' && editingItem && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    当前库存信息
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">当前余量</span>
                    <span className={`font-bold ${
                      editingItem.currentQuantity <= 0 ? 'text-danger-500' :
                      editingItem.currentQuantity <= editingItem.threshold ? 'text-warning-500' :
                        'text-success-600'
                    }`}>
                      {editingItem.currentQuantity} {editingItem.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        editingItem.currentQuantity <= 0 ? 'bg-danger-400' :
                          editingItem.currentQuantity <= editingItem.threshold ? 'bg-warning-400' :
                            'bg-success-400'
                      }`}
                      style={{
                        width: `${Math.min(100, editingItem.totalQuantity > 0 ? (editingItem.currentQuantity / editingItem.totalQuantity) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总数量
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.totalQuantity}
                    onChange={(e) => {
                      const newTotal = Math.max(0, parseInt(e.target.value) || 0);
                      setFormData({ ...formData, totalQuantity: newTotal });
                    }}
                    className={`flex-1 p-3 border-2 rounded-xl focus:border-primary-400 outline-none transition-colors ${
                      editMode === 'edit' && editingItem && formData.totalQuantity < editingItem.currentQuantity
                        ? 'border-warning-400 bg-warning-50'
                        : 'border-gray-200'
                    }`}
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors bg-white"
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                {editMode === 'edit' && editingItem && formData.totalQuantity < editingItem.currentQuantity && (
                  <div className="flex items-start gap-1.5 mt-2 text-warning-600 text-xs bg-warning-50 p-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      总数量小于当前库存 {editingItem.currentQuantity}{editingItem.unit}，
                      保存后当前库存将自动调整为 {formData.totalQuantity}{editingItem.unit}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  安全阈值
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.threshold}
                  onChange={(e) => {
                    const newThreshold = Math.max(0, parseInt(e.target.value) || 0);
                    setFormData({ ...formData, threshold: newThreshold });
                  }}
                  className={`w-full p-3 border-2 rounded-xl focus:border-primary-400 outline-none transition-colors ${
                    formData.threshold > formData.totalQuantity
                      ? 'border-warning-400 bg-warning-50'
                      : 'border-gray-200'
                  }`}
                />
                {formData.threshold > formData.totalQuantity && (
                  <div className="flex items-start gap-1.5 mt-2 text-warning-600 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>阈值不能超过总数量，保存后将自动调整</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  当库存低于此数量时会发出补货提醒
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="mt-6 w-full py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {editMode === 'add' ? '添加' : '保存'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
