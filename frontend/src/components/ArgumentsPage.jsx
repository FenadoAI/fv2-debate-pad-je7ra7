import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Sparkles,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const ArgumentsPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newArgument, setNewArgument] = useState({ point: '', facts: '', side: 'for' });
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/topics/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      console.error('Error fetching topic:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const addArgument = async (e) => {
    e.preventDefault();
    if (!newArgument.point.trim()) return;

    try {
      setLoading(true);
      const supporting_facts = newArgument.facts
        ? newArgument.facts.split('\n').filter(fact => fact.trim())
        : [];

      const response = await axios.post(`${API}/topics/${topicId}/arguments`, {
        point: newArgument.point,
        supporting_facts,
        side: newArgument.side
      });

      setTopic(response.data);
      setNewArgument({ point: '', facts: '', side: 'for' });
    } catch (error) {
      console.error('Error adding argument:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArgument = async (argumentId) => {
    try {
      await axios.delete(`${API}/topics/${topicId}/arguments/${argumentId}`);
      fetchTopic(); // Refresh the topic
    } catch (error) {
      console.error('Error deleting argument:', error);
    }
  };

  const generateAIArguments = async () => {
    if (!topic) return;

    try {
      setGeneratingAI(true);
      const response = await axios.post(`${API}/generate-arguments`, {
        topic: topic.title
      });

      const aiData = response.data;

      // Add AI-generated arguments to the topic
      for (const arg of aiData.arguments_for) {
        await axios.post(`${API}/topics/${topicId}/arguments`, {
          point: arg.point,
          supporting_facts: arg.supporting_facts,
          side: 'for'
        });
      }

      for (const arg of aiData.arguments_against) {
        await axios.post(`${API}/topics/${topicId}/arguments`, {
          point: arg.point,
          supporting_facts: arg.supporting_facts,
          side: 'against'
        });
      }

      // Refresh the topic
      fetchTopic();
    } catch (error) {
      console.error('Error generating AI arguments:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const ArgumentCard = ({ argument, side }) => (
    <Card className="mb-4 shadow-md border-0 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {side === 'for' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <p className="font-medium text-gray-900 leading-relaxed">
                {argument.point}
              </p>
            </div>
            {argument.supporting_facts && argument.supporting_facts.length > 0 && (
              <div className="ml-6">
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {argument.supporting_facts.map((fact, idx) => (
                    <li key={idx} className="leading-relaxed">{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteArgument(argument.id)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !topic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading debate topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <p className="text-gray-600">Topic not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {topic.title}
              </h1>
            </div>
            <div className="flex gap-3 text-sm text-gray-600">
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                For: {topic.arguments_for?.length || 0}
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                Against: {topic.arguments_against?.length || 0}
              </Badge>
            </div>
          </div>

          <Button
            onClick={generateAIArguments}
            disabled={generatingAI}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingAI ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>
      </div>

      {/* Add Argument Form */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Argument
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addArgument} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={newArgument.side === 'for' ? 'default' : 'outline'}
                onClick={() => setNewArgument({ ...newArgument, side: 'for' })}
                className={newArgument.side === 'for' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                For
              </Button>
              <Button
                type="button"
                variant={newArgument.side === 'against' ? 'default' : 'outline'}
                onClick={() => setNewArgument({ ...newArgument, side: 'against' })}
                className={newArgument.side === 'against' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Against
              </Button>
            </div>

            <Input
              type="text"
              placeholder="Enter your main argument point"
              value={newArgument.point}
              onChange={(e) => setNewArgument({ ...newArgument, point: e.target.value })}
              className="text-base"
              disabled={loading}
              required
            />

            <Textarea
              placeholder="Enter supporting facts (one per line, optional)"
              value={newArgument.facts}
              onChange={(e) => setNewArgument({ ...newArgument, facts: e.target.value })}
              className="text-base min-h-[100px]"
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !newArgument.point.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Adding...' : 'Add Argument'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Arguments Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Arguments For */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Arguments For</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              {topic.arguments_for?.length || 0}
            </Badge>
          </div>

          {topic.arguments_for?.length > 0 ? (
            topic.arguments_for.map((argument) => (
              <ArgumentCard key={argument.id} argument={argument} side="for" />
            ))
          ) : (
            <Card className="border-dashed border-2 border-green-200 bg-green-50">
              <CardContent className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-700">No arguments for this side yet</p>
                <p className="text-green-600 text-sm mt-1">Add your first argument above</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Arguments Against */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Arguments Against</h2>
            <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
              {topic.arguments_against?.length || 0}
            </Badge>
          </div>

          {topic.arguments_against?.length > 0 ? (
            topic.arguments_against.map((argument) => (
              <ArgumentCard key={argument.id} argument={argument} side="against" />
            ))
          ) : (
            <Card className="border-dashed border-2 border-red-200 bg-red-50">
              <CardContent className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-700">No arguments for this side yet</p>
                <p className="text-red-600 text-sm mt-1">Add your first argument above</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArgumentsPage;