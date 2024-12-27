// controllers/commentController.js
const Comment = require('../models/Comment');
const Task = require('../models/Task');

exports.createComment = async (req, res) => {
  try {
    const { content, taskId, author, mentions, parentComment } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newComment = new Comment({
      content,
      task: taskId,
      author,
      mentions,
      parentComment
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error });
  }
};

exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name')
      .populate('mentions', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mentions } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content, mentions },
      { new: true }
    ).populate('author mentions');

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Also delete all replies to this comment
    await Comment.deleteMany({ parentComment: id });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
};