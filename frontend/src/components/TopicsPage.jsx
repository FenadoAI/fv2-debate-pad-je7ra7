import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, MessageSquare, Clock, Search, Lightbulb } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`${API}/topics`, {
        title: newTopicTitle
      });
      setTopics([response.data, ...topics]);
      setNewTopicTitle('');
    } catch (error) {
      console.error('Error creating topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalArguments = (topic) => {
    return (topic.arguments_for?.length || 0) + (topic.arguments_against?.length || 0);
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Debate Prep Pad</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Organize and prepare arguments for any debate topic
        </p>
      </div>

      {/* Create Topic Form */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Create New Debate Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTopic} className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter your debate topic (e.g., 'Should AI be used in education?')"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="flex-1 text-base"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !newTopicTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {loading ? 'Creating...' : 'Create Topic'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      {topics.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Topics List */}
      {loading && topics.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading topics...</p>
        </div>
      ) : filteredTopics.length === 0 && topics.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-gray-300">
          <CardContent className="pt-6">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No debate topics yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first debate topic to start organizing arguments
            </p>
          </CardContent>
        </Card>
      ) : filteredTopics.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent className="pt-6">
            <p className="text-gray-600">No topics match your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md"
              onClick={() => navigate(`/topic/${topic.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-snug line-clamp-2">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      For: {topic.arguments_for?.length || 0}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Against: {topic.arguments_against?.length || 0}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    {getTotalArguments(topic)} total
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatDate(topic.created_at)}</span>
                  </div>
                  {topic.updated_at !== topic.created_at && (
                    <span className="text-xs">
                      Updated {formatDate(topic.updated_at)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-gray-500">
        <p>Click on any topic to start organizing arguments</p>
      </div>
    </div>
  );
};

export default TopicsPage;