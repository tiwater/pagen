'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/setting';
import { Textarea } from '@/components/ui/textarea';

export default function RulesSettingsPage() {
    const { rules, addRule, deleteRule } = useSettingsStore();
    const [newRule, setNewRule] = useState<string>('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            addRule(newRule.trim());
            setNewRule('');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Rules</h1>
            <Card className="mb-4">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Add New Rule</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Textarea
                            rows={5}
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            placeholder="Enter rule description, such as 'The webpage should have a header with the title of the webpage'"
                            className="flex-1"
                        />
                        <Button onClick={handleAddRule}>Add Rule</Button>
                    </div>
                </CardContent>
            </Card>
            <div>
                {rules.map((rule, index) => (
                    <Card key={index} className="mb-2">
                        <CardContent className="flex justify-between items-center">
                            <span>{rule}</span>
                            <Button variant="destructive" onClick={() => deleteRule(index)}>
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
