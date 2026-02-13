import React, { useState, useEffect, useMemo, useRef } from 'react';
import './style.css';
import api from './api';
import { BarChart, LineChart, PieChart, ColumnChart, AreaChart } from './NivoCharts';

interface Plant {
  id: number;
  name: string;
}

interface Document {
  [key: string]: any; // Dynamic structure based on stored procedure result
}

interface DocumentData {
  [key: string]: any; // Data from usp_GetPlantDocumentData
}

interface DashboardProps {
  onLogout: () => void;
  user?: {
    Id: number;
    FullName: string;
    Email: string;
    Role: string;
    DOB?: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('Select Plant');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string>('Select Document');
  const [isDocumentDropdownOpen, setIsDocumentDropdownOpen] = useState(false);
  const [documentDropdownError, setDocumentDropdownError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);
  const [loadingDocumentData, setLoadingDocumentData] = useState(false);
  const [documentDataError, setDocumentDataError] = useState<string | null>(null);
  const [selectedDocTypeCode, setSelectedDocTypeCode] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'column'>('bar');
  const [selectedYColumns, setSelectedYColumns] = useState<string[]>(['TotalDocAmt']);
  const [selectedPieParameter, setSelectedPieParameter] = useState<string>('TotalDocAmt');
  
  const plantDropdownRef = useRef<HTMLDivElement | null>(null);
  const documentDropdownRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  const chartTypes = useMemo(
    () => [
      { label: 'Bar', value: 'bar' },
      { label: 'Line', value: 'line' },
      { label: 'Pie', value: 'pie' },
      { label: 'Column', value: 'column' },
      { label: 'Area', value: 'area' }
    ],
    []
  );

  const formatHeader = (key: string) =>
    key.replace(/^[vm]/, '').replace(/([A-Z])/g, ' $1').trim();

  const isNumericValue = (value: any) => {
    if (value === null || value === undefined || value === '') return false;
    const normalized = typeof value === 'string' ? value.replace(/,/g, '') : value;
    return !Number.isNaN(Number(normalized)) && Number.isFinite(Number(normalized));
  };

  const detectChartKeys = (rows: DocumentData[]) => {
    if (!rows || rows.length === 0) return null;
    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    const labelKey =
      keys.find((key) => /fin\s*year|year|period/i.test(key)) ||
      keys.find((key) => typeof firstRow[key] === 'string') ||
      keys[0];

    const numericKeys = keys.filter((key) => isNumericValue(firstRow[key]));

    const targetColumns = ['GrossTotal', 'NetInvoiceAmt', 'TotalTaxAmt', 'TotalDocAmt'];
    const availableTargets = numericKeys.filter((key) =>
      targetColumns.some((target) => key.toLowerCase().includes(target.toLowerCase()))
    );

    return { labelKey, numericKeys, availableTargets };
  };

  // Detect keys from document data
  const detectedChartKeys = useMemo(() => {
    return documentData.length > 0 ? detectChartKeys(documentData) : null;
  }, [documentData]);

  // Transform document data to Nivo format based on chart type
  const transformDataForNivo = useMemo(() => {
    if (!documentData.length || !detectedChartKeys?.labelKey) return null;

    const { labelKey } = detectedChartKeys;
    const columnsToUse = 
      chartType === 'pie' 
        ? [selectedPieParameter] 
        : selectedYColumns;

    if (chartType === 'pie') {
      // Convert to Nivo pie format: [{ id: 'name', value: amount }, ...]
      const colKey = selectedPieParameter;
      return documentData.map((row) => {
        const raw = row[colKey];
        const normalized = typeof raw === 'string' ? raw.replace(/,/g, '') : raw;
        const value = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
        return {
          id: String(row[labelKey] ?? ''),
          label: String(row[labelKey] ?? ''),
          value: value
        };
      });
    } else if (chartType === 'line' || chartType === 'area') {
      // Convert to Nivo line/area format: [{ id: 'series', data: [{ x, y }, ...] }, ...]
      return columnsToUse.map((colKey) => ({
        id: formatHeader(colKey),
        data: documentData.map((row) => {
          const raw = row[colKey];
          const normalized = typeof raw === 'string' ? raw.replace(/,/g, '') : raw;
          const y = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
          return {
            x: String(row[labelKey] ?? ''),
            y: y
          };
        })
      }));
    } else {
      // Convert to Nivo bar/column format: [{ labelKey: 'value', col1: amount, col2: amount }, ...]
      return documentData.map((row) => {
        const record: any = { [labelKey]: String(row[labelKey] ?? '') };
        columnsToUse.forEach((colKey) => {
          const raw = row[colKey];
          const normalized = typeof raw === 'string' ? raw.replace(/,/g, '') : raw;
          record[colKey] = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
        });
        return record;
      });
    }
  }, [documentData, detectedChartKeys, chartType, selectedYColumns, selectedPieParameter]);

  // Auto-select available target columns on data load
  useEffect(() => {
    if (detectedChartKeys?.availableTargets && detectedChartKeys.availableTargets.length > 0) {
      setSelectedYColumns(detectedChartKeys.availableTargets);
      setSelectedPieParameter(detectedChartKeys.availableTargets[0]);
    } else if (detectedChartKeys?.numericKeys && detectedChartKeys.numericKeys.length > 0) {
      setSelectedYColumns([detectedChartKeys.numericKeys[0]]);
      setSelectedPieParameter(detectedChartKeys.numericKeys[0]);
    }
  }, [detectedChartKeys?.availableTargets]);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (selectedPlant && selectedPlant !== 'Select Plant') {
      fetchDocuments(selectedPlant);
    } else {
      setDocuments([]);
      setDocumentsError(null);
      setDocumentData([]);
      setSelectedDocument('Select Document');
      setSelectedDocTypeCode('');
    }
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant !== 'Select Plant' && selectedDocTypeCode) {
      fetchDocumentData(selectedPlant, selectedDocTypeCode);
    } else {
      setDocumentData([]);
    }
  }, [selectedPlant, selectedDocTypeCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (plantDropdownRef.current && !plantDropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      if (documentDropdownRef.current && !documentDropdownRef.current.contains(target)) {
        setIsDocumentDropdownOpen(false);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/plants');
      
      if (data.success) {
        setPlants(data.plants);
      } else {
        setError(data.message || 'Failed to load plants');
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Unable to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant.name);
    setIsDropdownOpen(false);
    setSelectedDocument('Select Document'); // Reset document selection
    setDocumentDropdownError(null);
  };

  const handleDocumentDropdownClick = () => {
    if (selectedPlant === 'Select Plant') {
      setDocumentDropdownError('Please select a plant first');
      return;
    }
    setDocumentDropdownError(null);
    setIsDocumentDropdownOpen(!isDocumentDropdownOpen);
    setIsDropdownOpen(false);
  };

  const handleDocumentSelect = (doc: Document) => {
    console.log('Selected document:', doc);
    console.log('Available keys:', Object.keys(doc));
    
    // Try multiple possible field names for document type code
    const docTypeCode = doc.vDocTypeCode || doc.DocTypeCode || doc.vDocType || 
                        doc.doctypecode || doc.DocumentTypeCode || doc.Code || '';
    
    // Try multiple possible field names for document description/name
    const docName = doc.vDocDescription || doc.DocDescription || doc.Description || 
                   doc.vDocType || doc.DocType || doc.DocumentType || 
                   doc.Name || doc.name || doc.Title || 'Unknown';
    
    console.log('Extracted DocTypeCode:', docTypeCode);
    console.log('Extracted Document Name:', docName);
    
    setSelectedDocument(docName);
    setSelectedDocTypeCode(docTypeCode);
    setIsDocumentDropdownOpen(false);
  };

  const fetchDocuments = async (plantName: string) => {
    try {
      setLoadingDocuments(true);
      setDocumentsError(null);
      
      console.log('Fetching documents for plant:', plantName);
      
      const encodedPlantName = encodeURIComponent(plantName);
      const data = await api.get(`/api/plants/${encodedPlantName}/documents`);
      
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Documents received:', data.documents.length);
        if (data.documents.length > 0) {
          console.log('First document structure:', data.documents[0]);
          console.log('First document keys:', Object.keys(data.documents[0]));
        }
        setDocuments(data.documents);
      } else {
        setDocumentsError(data.message || 'Failed to load documents');
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentsError('Unable to load documents');
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchDocumentData = async (plantName: string, docTypeCode: string) => {
    try {
      setLoadingDocumentData(true);
      setDocumentDataError(null);
      
      console.log('Fetching document data for:', plantName, docTypeCode);
      
      const encodedPlantName = encodeURIComponent(plantName);
      const encodedDocTypeCode = encodeURIComponent(docTypeCode);
      const data = await api.get(`/api/plants/${encodedPlantName}/documents/${encodedDocTypeCode}/data`);
      
      console.log('Document data received:', data);
      
      if (data.success) {
        setDocumentData(data.data);
      } else {
        setDocumentDataError(data.message || 'Failed to load document data');
        setDocumentData([]);
      }
    } catch (err) {
      console.error('Error fetching document data:', err);
      setDocumentDataError('Unable to load document data');
      setDocumentData([]);
    } finally {
      setLoadingDocumentData(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Top Navigation Bar - Professional */}
      <nav style={{
        backgroundColor: '#16265c',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: 'white' 
        }}>
          PharmaNET
        </div>
        {/* User Profile Dropdown */}
        <div style={{ position: 'relative', display: 'inline-block' }} ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{user?.FullName || 'User'}</span>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              style={{ 
                transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {isUserDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e5e7eb',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600' }}>{user?.FullName}</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{user?.Email}</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area with Two-Column Layout */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '2rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start'
      }}>
        {/* Left Side - Plant Selection */}
        <div style={{
          flex: '0 0 350px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Select Plant
          </h2>
          
          <div style={{ position: 'relative' }} ref={plantDropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                backgroundColor: '#f9fafb',
                color: '#1f2937',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {loading ? 'Loading...' : selectedPlant}
              </span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                style={{ 
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                  marginLeft: '0.5rem'
                }}
              >
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                border: '1px solid #e5e7eb'
              }}>
                {error ? (
                  <div style={{
                    padding: '1rem',
                    color: '#dc2626',
                    fontSize: '0.875rem'
                  }}>
                    {error}
                  </div>
                ) : plants.length === 0 ? (
                  <div style={{
                    padding: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    No plants available
                  </div>
                ) : (
                  plants.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => handlePlantSelect(plant)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: selectedPlant === plant.name ? '#eff6ff' : 'white',
                        color: '#1f2937',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPlant !== plant.name) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPlant !== plant.name) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {plant.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Select Document Dropdown */}
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Select Document
            </h2>
            
            <div style={{ position: 'relative' }} ref={documentDropdownRef}>
              <button
                onClick={handleDocumentDropdownClick}
                style={{
                  width: '100%',
                  backgroundColor: '#f9fafb',
                  color: '#1f2937',
                  padding: '0.75rem 1rem',
                  border: documentDropdownError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!documentDropdownError) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!documentDropdownError) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {loadingDocuments ? 'Loading...' : selectedDocument}
                </span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  style={{ 
                    transform: isDocumentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                    marginLeft: '0.5rem'
                  }}
                >
                  <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {documentDropdownError && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '0.875rem'
                }}>
                  {documentDropdownError}
                </div>
              )}
              
              {isDocumentDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  border: '1px solid #e5e7eb'
                }}>
                  {documentsError ? (
                    <div style={{
                      padding: '1rem',
                      color: '#dc2626',
                      fontSize: '0.875rem'
                    }}>
                      {documentsError}
                    </div>
                  ) : documents.length === 0 ? (
                    <div style={{
                      padding: '1rem',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      No documents available
                    </div>
                  ) : (
                    documents.map((doc, index) => {
                      // Try multiple possible field names for document name
                      const docName = doc.vDocDescription || doc.DocDescription || doc.Description || 
                                     doc.vDocType || doc.DocType || doc.DocumentType || 
                                     doc.Name || doc.name || doc.Title || 'Unknown';
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDocumentSelect(doc)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: selectedDocument === docName ? '#eff6ff' : 'white',
                            color: '#1f2937',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedDocument !== docName) {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedDocument !== docName) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          {docName}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Document Data Table */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: '400px'
        }}>
          {/* Table Header with Plant and Document Info */}
          {selectedPlant !== 'Select Plant' && selectedDocument !== 'Select Document' && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Plant Name: </span>
                  <span style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '600' }}>{selectedPlant}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Document Type: </span>
                  <span style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '600' }}>{selectedDocument}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Document Analysis
            </h2>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: viewMode === 'table' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  backgroundColor: viewMode === 'table' ? 'rgba(59, 130, 246, 0.1)' : 'white',
                  color: viewMode === 'table' ? '#3b82f6' : '#1f2937',
                  fontSize: '0.85rem',
                  fontWeight: 100,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = viewMode === 'table' ? '#3b82f6' : '#d1d5db';
                  e.currentTarget.style.backgroundColor = viewMode === 'table' ? 'rgba(59, 130, 246, 0.1)' : 'white';
                }}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: viewMode === 'chart' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  backgroundColor: viewMode === 'chart' ? 'rgba(59, 130, 246, 0.1)' : 'white',
                  color: viewMode === 'chart' ? '#3b82f6' : '#1f2937',
                  fontSize: '0.85rem',
                  fontWeight: 100,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = viewMode === 'chart' ? '#3b82f6' : '#d1d5db';
                  e.currentTarget.style.backgroundColor = viewMode === 'chart' ? 'rgba(59, 130, 246, 0.1)' : 'white';
                }}
              >
                Chart
              </button>
            </div>
          </div>

          {viewMode === 'chart' && documentData.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                flex: 1
              }}>
                {chartType === 'pie' ? (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        display: 'block',
                        marginBottom: '0.5rem'
                      }}>
                        Select Parameter:
                      </span>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        {detectedChartKeys?.numericKeys?.map((colKey) => (
                          <label
                            key={colKey}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="radio"
                              name="pie-parameter"
                              value={colKey}
                              checked={selectedPieParameter === colKey}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPieParameter(colKey);
                                }
                              }}
                              style={{
                                cursor: 'pointer'
                              }}
                            />
                            <span>{formatHeader(colKey)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#6b7280'
                    }}>
                      Y-Axis Columns:
                    </span>
                    {detectedChartKeys?.numericKeys?.map((colKey) => (
                      <label
                        key={colKey}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedYColumns.includes(colKey)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedYColumns([...selectedYColumns, colKey]);
                            } else {
                              setSelectedYColumns(selectedYColumns.filter((col) => col !== colKey));
                            }
                          }}
                          style={{
                            cursor: 'pointer'
                          }}
                        />
                        <span>{formatHeader(colKey)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as typeof chartType)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {chartTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPlant === 'Select Plant' ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.95rem'
            }}>
              Please select a plant from the left panel
            </div>
          ) : selectedDocument === 'Select Document' ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.95rem'
            }}>
              Please select a document type from the left panel
            </div>
          ) : loadingDocumentData ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>Loading document data...</div>
            </div>
          ) : documentDataError ? (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '0.9rem'
            }}>
              {documentDataError}
            </div>
          ) : documentData.length === 0 ? (
            <div style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px dashed #d1d5db',
              fontSize: '0.95rem'
            }}>
              No data found for this selection
            </div>
          ) : viewMode === 'table' ? (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              overflow: 'auto'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Object.keys(documentData[0]).length}, minmax(120px, 1fr))`,
                gap: '1px',
                backgroundColor: '#16265c',
                padding: '0.75rem 1rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#f7f7f7',
                borderBottom: '2px solid #ffffff',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {Object.keys(documentData[0]).map((key) => (
                  <div key={key} style={{ padding: '0.25rem', whiteSpace: 'nowrap' }}>
                    {formatHeader(key)}
                  </div>
                ))}
              </div>
 
              {/* Table Rows */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {documentData.map((row, index) => (
                  <div   
                    key={index} 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Object.keys(row).length}, minmax(120px, 1fr))`,
                      gap: '1px',
                      padding: '0.75rem 1rem',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: index < documentData.length - 1 ? '1px solid #d3dbec' : 'none',
                      fontSize: '0.875rem',
                      color: '#1f2937',
                      transition: 'background-color 0.15s ease'            
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fcfcfc';
                    }}
                  >
                    {Object.entries(row).map(([key, value]) => (
                      <div key={key} style={{ 
                        padding: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {value !== null && value !== undefined ? String(value) : '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : transformDataForNivo ? (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '1rem',
              minHeight: '420px',
              backgroundColor: '#ffffff'
            }}>
              {chartType === 'pie' && (
                <div>
                  <div style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#6b7280'
                      }}>
                        Parameter:
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4', '#8b5cf6', '#14b8a6', '#f97316', '#22c55e'][
                              (detectedChartKeys?.numericKeys?.indexOf(selectedPieParameter) || 0) % 10
                            ]
                          }}
                        />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1f2937'
                        }}>
                          {formatHeader(selectedPieParameter)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <PieChart
                    data={transformDataForNivo}
                    height={400}
                    showLegend={true}
                  />
                </div>
              )}

              {chartType === 'line' && (
                <LineChart
                  data={transformDataForNivo}
                  height={400}
                  showLegend={true}
                />
              )}

              {chartType === 'area' && (
                <AreaChart
                  data={transformDataForNivo}
                  height={400}
                  showLegend={true}
                />
              )}

              {chartType === 'bar' && (
                <BarChart
                  data={transformDataForNivo}
                  xAxisKey={detectedChartKeys?.labelKey}
                  yAxisKeys={selectedYColumns}
                  height={400}
                  showLegend={true}
                  enableStackMode={false}
                  invertAxes={true}
                />
              )}

              {chartType === 'column' && (
                <ColumnChart
                  data={transformDataForNivo}
                  xAxisKey={detectedChartKeys?.labelKey}
                  yAxisKeys={selectedYColumns}
                  height={400}
                  showLegend={true}
                  enableStackMode={false}
                />
              )}
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.95rem'
            }}>
              Unable to render chart - please check your data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
