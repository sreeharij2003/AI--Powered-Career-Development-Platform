import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import { format } from "date-fns";
import {
    Edit2,
    FileDown,
    FileUp,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CoverLetter {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  jobId?: string;
  company?: string;
}

const CoverLetterHistory = () => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      const response = await API.get('/api/coverletter/history');
      setCoverLetters(response.data);
    } catch (error) {
      toast.error("Failed to fetch cover letters");
    }
  };

  const handleEdit = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    setEditedContent(letter.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedLetter) return;
    
    try {
      await API.put(`/api/coverletter/${selectedLetter._id}`, {
        content: editedContent
      });
      toast.success("Cover letter updated successfully");
      setIsEditing(false);
      fetchCoverLetters();
    } catch (error) {
      toast.error("Failed to update cover letter");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/api/coverletter/${id}`);
      toast.success("Cover letter deleted successfully");
      fetchCoverLetters();
    } catch (error) {
      toast.error("Failed to delete cover letter");
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!selectedLetter) return;
    
    try {
      const response = await API.get(`/api/coverletter/export/${selectedLetter._id}`, {
        params: { format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cover-letter-${selectedLetter.title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cover Letter History</h2>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard?tool=cover-letter'}>
          Generate New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cover Letter List */}
        <div className="space-y-4">
          {coverLetters.map((letter) => (
            <Card 
              key={letter._id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedLetter?._id === letter._id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedLetter(letter)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{letter.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(letter.createdAt), 'MMM d, yyyy')}
                    </p>
                    {letter.company && (
                      <p className="text-sm text-muted-foreground">
                        Company: {letter.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(letter);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(letter._id);
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cover Letter Preview/Edit */}
        {selectedLetter && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Cover Letter</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>
                    <FileUp className="h-4 w-4 mr-2" />
                    DOCX
                  </Button>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[400px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">
                    {selectedLetter.content}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoverLetterHistory; 