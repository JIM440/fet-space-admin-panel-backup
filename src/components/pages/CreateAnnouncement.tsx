import React, { useState } from 'react';
import { useCreateAnnouncement } from '../../hooks/useAnnouncements';

const CreateAnnouncement: React.FC = () => {
  const [form, setForm] = useState({
    type: 'regular', // 'regular' or 'poll'
    title: '',
    content: '',
    allow_multiple_answers: false,
    options: ['', ''],
  });
  const { mutate: createAnnouncement, isPending, error } = useCreateAnnouncement();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      is_poll: form.type === 'poll',
    };

    if (form.type === 'poll') {
      payload.poll = {
        allow_multiple_answers: form.allow_multiple_answers,
        type: 'general', // Default to 'general' as per schema; can be extended
        options: form.options.filter((option) => option.trim() !== ''),
      };
    }

    console.log('payload:', payload);
    createAnnouncement(payload, {
      onSuccess: () => {
        setForm({ type: 'regular', title: '', content: '', allow_multiple_answers: false, options: ['', ''] });
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Create Announcement</h1>
      {error && <p className="text-red-500 mb-4">{error.message}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="regular">Regular Announcement</option>
            <option value="poll">Poll Announcement</option>
          </select>
        </div>

        {form.type === 'regular' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content"
                rows={5}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Question (Title)</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter poll question"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter additional details"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
              {form.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              ))}
              <button
                type="button"
                onClick={addOption}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Option
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="allow_multiple_answers"
                checked={form.allow_multiple_answers}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-300">Allow Multiple Answers</label>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isPending ? 'Creating...' : 'Create Announcement'}
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;