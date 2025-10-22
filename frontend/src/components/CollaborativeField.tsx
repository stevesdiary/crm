import React, { useState, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { useCollaborativeEditing } from '../hooks/useCollaborativeEditing';

interface CollaborativeFieldProps {
  recordId: string;
  field: string;
  value: any;
  onChange: (value: any) => void;
  children: React.ReactElement;
}

export const CollaborativeField: React.FC<CollaborativeFieldProps> = ({
  recordId,
  field,
  value,
  onChange,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const {
    startEditing,
    stopEditing,
    broadcastChange,
    isFieldLocked,
    getFieldLock,
    changes,
  } = useCollaborativeEditing(recordId);

  const fieldLock = getFieldLock(field);
  const isLocked = isFieldLocked(field);
  const hasRemoteChanges = field in changes;

  useEffect(() => {
    if (hasRemoteChanges) {
      setLocalValue(changes[field]);
    }
  }, [changes, field, hasRemoteChanges]);

  const handleFocus = () => {
    if (!isLocked) {
      setIsEditing(true);
      startEditing(field);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    stopEditing(field);
    onChange(localValue);
  };

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    broadcastChange(field, newValue);
  };

  const childProps = {
    value: localValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled: isLocked && !isEditing,
  };

  return (
    <div className="relative">
      {React.cloneElement(children, childProps)}
      
      {isLocked && !isEditing && (
        <div className="absolute inset-0 bg-yellow-50 bg-opacity-75 flex items-center justify-center rounded border-2 border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700 text-sm">
            <Lock className="w-4 h-4" />
            <User className="w-4 h-4" />
            <span>Being edited by another user</span>
          </div>
        </div>
      )}
      
      {hasRemoteChanges && !isEditing && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Updated
        </div>
      )}
    </div>
  );
};