import React, { useState } from 'react';
import { Clone, DocumentStatus } from '../../../../types/clone';
import { Badge } from '../../../ui/badge';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface CloneCardProps {
    clone: Clone;
    onSelect: () => void;
}

export const CloneCard: React.FC<CloneCardProps> = ({ clone, onSelect }) => {
    const [showDocuments, setShowDocuments] = useState(false);
    const documentCount = clone.clone_documents?.length || 0;
    
    const handleDocumentsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDocuments(!showDocuments);
    };
    
    return (
        <div 
            onClick={onSelect}
            className={`h-[140px] p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all bg-black/5 flex flex-col relative ${showDocuments ? 'mb-[200px]' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{clone.name}</h3>
                    {clone.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                            {clone.description}
                        </p>
                    )}
                </div>
                <Badge variant={clone.visibility === 'global' ? 'secondary' : 'outline'}>
                    {clone.visibility}
                </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm text-blue-500 mt-auto">
                <button 
                    onClick={handleDocumentsClick}
                    className="flex items-center gap-1 hover:text-blue-600"
                >
                    <span>{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
                    {showDocuments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <span className="text-gray-500">Created {new Date(clone.created_at).toLocaleDateString()}</span>
            </div>
            
            {showDocuments && documentCount > 0 && (
                <div 
                    className="absolute left-0 right-0 top-[140px] bg-black/5 border-t border-x border-b rounded-b-lg max-h-[200px] overflow-y-auto z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2 space-y-1">
                        {clone.clone_documents?.map((doc) => (
                            <div 
                                key={doc.id} 
                                className="flex items-center justify-between text-sm py-1"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="text-gray-600">{doc.file_name}</span>
                                </div>
                                <span className="text-gray-400 text-xs">
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {documentCount === 0 && (
                <div className="mt-2 text-sm text-amber-500">
                    No training documents yet
                </div>
            )}
        </div>
    );
}; 