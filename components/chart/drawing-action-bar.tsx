"use client";

import {
  GripVertical,
  Shapes,
  Pencil,
  Type,
  Minus,
  CircleDot,
  Crosshair,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

type DrawingActionBarProps = {
  locked?: boolean;
  onDelete?: () => void;
  onToggleLock?: () => void;
};

export default function DrawingActionBar({
  locked = false,
  onDelete,
  onToggleLock,
}: DrawingActionBarProps) {
  return (
    <div
      className="pointer-events-auto absolute z-[100] flex items-center gap-1 rounded-xl border border-[#dbe5e9] bg-white px-2 py-1.5 shadow-[0_8px_30px_rgba(15,45,55,0.18)]"
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {/* Drag / move */}
      <button
        type="button"
        title="Move"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9aa8ae] transition hover:bg-[#f1f7f9] hover:text-[#173944]"
      >
        <GripVertical
          size={17}
          strokeWidth={2}
        />
      </button>

      <div className="mx-0.5 h-6 w-px bg-[#e5ecef]" />

      {/* Drawing style */}
      <button
        type="button"
        title="Drawing style"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <Shapes
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* Edit */}
      <button
        type="button"
        title="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <Pencil
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* Text */}
      <button
        type="button"
        title="Add text"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <Type
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* Line style */}
      <button
        type="button"
        title="Line style"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <Minus
          size={21}
          strokeWidth={2}
        />
      </button>

      {/* Shape / settings */}
      <button
        type="button"
        title="Drawing settings"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <CircleDot
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* Crosshair / extend */}
      <button
        type="button"
        title="Extend drawing"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <Crosshair
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* Lock */}
      <button
        type="button"
        title={
          locked
            ? "Unlock drawing"
            : "Lock drawing"
        }
        onClick={onToggleLock}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        {locked ? (
          <Lock
            size={18}
            strokeWidth={2}
          />
        ) : (
          <Unlock
            size={18}
            strokeWidth={2}
          />
        )}
      </button>

      {/* Delete */}
      <button
        type="button"
        title="Delete drawing"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2
          size={18}
          strokeWidth={2}
        />
      </button>

      {/* More */}
      <button
        type="button"
        title="More"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#173944] transition hover:bg-[#eef8fb]"
      >
        <MoreHorizontal
          size={19}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}