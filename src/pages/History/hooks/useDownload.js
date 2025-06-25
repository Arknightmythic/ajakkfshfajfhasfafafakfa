import { useState, useCallback } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

async function useDownload(matchType, metadataId, format = 'csv'){

  try {
    const response = await axiosInstance.general.post('/history', {
        match_type: matchType,
        metadata_id: metadataId,
        format: format
    }, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matchType}_data_${metadataId}.${format}`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
} catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
}
};

export default useDownload;
