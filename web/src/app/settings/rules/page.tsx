'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/store/setting';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Icons } from '@/components/icons';
import { nanoid } from 'nanoid';

export default function RulesPage() {
    const { rules, addRule, deleteRule, updateRule } = useSettingsStore();

    return (
        <div className="container w-full min-h-screen p-2">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-semibold">Rules</h1>
                <Button variant="outline" size="icon" onClick={() => {
                    addRule({ id: nanoid(), title: 'New Rule', content: '' });
                }}>
                    <Icons.plus className="h-4 w-4" />
                </Button>
            </div>

            <Accordion type="single" collapsible className="group space-y-2 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                {rules.map((rule, index) => {
                    return (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline gap-2">
                                <div className="flex items-center gap-2 w-full">
                                    <Icons.listTodo className="h-4 w-4 shrink-0" />
                                    <Input value={rule.title || ''} onChange={(e) => {
                                        updateRule({ ...rule, title: e.target.value });
                                    }} className="font-medium flex-1" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col w-full gap-2">
                                <Textarea className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm bg-transparent shadow-none" rows={10} value={rule.content || ''} onChange={(e) => {
                                    updateRule({ ...rule, content: e.target.value });
                                }}
                                    placeholder="Enter your rule here as a markdown list..."
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRule(rule.id);
                                        }}
                                    >
                                        <Icons.trash className="h-4 w-4 shrink-0" />
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
