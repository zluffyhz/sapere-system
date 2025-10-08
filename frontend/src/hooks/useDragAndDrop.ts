import { useState, useRef, useCallback } from 'react';
import type { Appointment } from '@/types';

interface DragState {
  isDragging: boolean;
  draggedAppointment: Appointment | null;
  dragOffset: { x: number; y: number };
  dropTarget: { date: Date; time: string } | null;
}

interface UseDragAndDropProps {
  onAppointmentMove: (appointment: Appointment, newDate: Date, newTime: string) => void;
}

export const useDragAndDrop = ({ onAppointmentMove }: UseDragAndDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedAppointment: null,
    dragOffset: { x: 0, y: 0 },
    dropTarget: null
  });

  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((
    appointment: Appointment,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    dragStartPos.current = { x: clientX, y: clientY };

    setDragState({
      isDragging: true,
      draggedAppointment: appointment,
      dragOffset: { x: 0, y: 0 },
      dropTarget: null
    });

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, []);

  const handleDragMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !dragState.draggedAppointment) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const offsetX = clientX - dragStartPos.current.x;
    const offsetY = clientY - dragStartPos.current.y;

    setDragState(prev => ({
      ...prev,
      dragOffset: { x: offsetX, y: offsetY }
    }));

    // Find potential drop target
    const elementBelow = document.elementFromPoint(clientX, clientY);
    const timeSlot = elementBelow?.closest('[data-time-slot]');
    const dateCell = elementBelow?.closest('[data-date]');

    if (timeSlot && dateCell) {
      const time = timeSlot.getAttribute('data-time-slot');
      const dateStr = dateCell.getAttribute('data-date');
      
      if (time && dateStr) {
        const date = new Date(dateStr);
        setDragState(prev => ({
          ...prev,
          dropTarget: { date, time }
        }));
        
        // Add visual feedback
        timeSlot.classList.add('drop-target-active');
        return;
      }
    }

    // Remove previous drop target styling
    document.querySelectorAll('.drop-target-active').forEach(el => {
      el.classList.remove('drop-target-active');
    });

    setDragState(prev => ({
      ...prev,
      dropTarget: null
    }));
  }, [dragState.isDragging, dragState.draggedAppointment]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    // Remove drop target styling
    document.querySelectorAll('.drop-target-active').forEach(el => {
      el.classList.remove('drop-target-active');
    });

    // Check if we have a valid drop target
    if (dragState.dropTarget && dragState.draggedAppointment) {
      const { date, time } = dragState.dropTarget;
      onAppointmentMove(dragState.draggedAppointment, date, time);
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedAppointment: null,
      dragOffset: { x: 0, y: 0 },
      dropTarget: null
    });

    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, [dragState, onAppointmentMove]);

  // Add event listeners for mouse/touch events
  const attachEventListeners = useCallback(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      handleDragMove(e);
    };
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  return {
    dragState,
    handleDragStart,
    attachEventListeners
  };
};