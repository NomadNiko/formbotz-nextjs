import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { Submission, Form, User } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const formId = searchParams.get('formId') || '';

    const query: any = {};
    
    if (status) query.status = status;
    if (formId) query.formId = formId;

    const skip = (page - 1) * limit;
    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formIds = [...new Set(submissions.map(s => s.formId))];
    const forms = await Form.find({ _id: { $in: formIds } })
      .select('_id name displayName clientId')
      .lean();

    const clientIds = [...new Set(forms.map(f => f.clientId))];
    const clients = await User.find({ _id: { $in: clientIds } })
      .select('_id name email')
      .lean();

    const formMap = new Map(forms.map(f => [String(f._id), f]));
    const clientMap = new Map(clients.map(c => [String(c._id), c]));

    const submissionsWithDetails = submissions.map(sub => {
      const form = formMap.get(String(sub.formId));
      return {
        ...sub,
        form: form ? {
          _id: form._id,
          name: form.displayName || form.name,
        } : null,
        client: form ? clientMap.get(form.clientId) : null,
      };
    });

    return NextResponse.json({
      submissions: submissionsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
