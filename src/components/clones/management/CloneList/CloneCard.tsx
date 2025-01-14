import React from 'react';
import { Clone } from '../../../../types/clone';
import { Badge } from '../../../ui/badge';

interface CloneCardProps {
    clone: Clone;
    onSelect: () => void;
}

export const CloneCard: React.FC<CloneCardProps> = ({ clone, onSelect }) => {
    const documentCount = clone.documents?.length || 0;
    
    return (
        <div 
            onClick={onSelect}
            className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{clone.name}</h3>
                <Badge variant={clone.visibility === 'global' ? 'secondary' : 'outline'}>
                    {clone.visibility}
                </Badge>
            </div>
            
            {clone.description && (
                <p className="text-sm text-gray-600 mb-3">
                    {clone.description}
                </p>
            )}
            
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
                <span>Created {new Date(clone.created_at).toLocaleDateString()}</span>
            </div>
            
            {documentCount === 0 && (
                <div className="mt-2 text-sm text-amber-600">
                    No training documents yet
                </div>
            )}
        </div>
    );
}; 