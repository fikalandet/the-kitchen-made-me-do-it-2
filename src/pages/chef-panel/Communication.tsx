import React, { useState, useEffect } from 'react';
import { Send, Search, Bot, Paperclip, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CommunicationProps {
  activeSubTab: string;
}

interface Thread {
  id: string;
  party_a_id: string;
  party_b_id: string;
  type: string;
  status: string;
  last_activity_at: string;
  party_name?: string;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  type: string;
  delivery_status: string;
  read_at: string | null;
  created_at: string;
  sender_name?: string;
}

interface Template {
  id: string;
  trigger: string;
  subject: string;
  body: string;
  channels: string[];
  delay_minutes: number;
  enabled: boolean;
}

export const Communication: React.FC<CommunicationProps> = ({ activeSubTab }) => {
  const { user } = useAuth();
  const [internalTab, setInternalTab] = useState<'from-customers' | 'from-tkmmdi' | 'new-message'>('from-customers');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [unreadFromCustomers, setUnreadFromCustomers] = useState(0);
  const [unreadFromTkmmdi, setUnreadFromTkmmdi] = useState(0);

  useEffect(() => {
    if (activeSubTab === 'messages') {
      fetchThreads();
    } else if (activeSubTab === 'auto-messages') {
      fetchTemplates();
    }
  }, [activeSubTab, user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread);
      markThreadAsRead(selectedThread);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('message_threads')
      .select('*, party_a:profiles!party_a_id(display_name), party_b:profiles!party_b_id(display_name)')
      .or(`party_a_id.eq.${user.id},party_b_id.eq.${user.id}`)
      .order('last_activity_at', { ascending: false });

    if (data) {
      const processedThreads = data.map(t => ({
        ...t,
        party_name: t.party_a_id === user.id ? t.party_b?.display_name : t.party_a?.display_name
      }));
      setThreads(processedThreads);

      const customerThreads = processedThreads.filter(t =>
        ['customer_request', 'customer_wish', 'order', 'complaint'].includes(t.type)
      );
      const tkmmdiThreads = processedThreads.filter(t =>
        ['tkm_info', 'tkm_system', 'tkm_competition', 'tkm_feedback', 'tkm_personal'].includes(t.type)
      );

      setUnreadFromCustomers(customerThreads.filter(t => t.status === 'unread').length);
      setUnreadFromTkmmdi(tkmmdiThreads.filter(t => t.status === 'unread').length);
    }
  };

  const fetchMessages = async (threadId: string) => {
    const { data } = await supabase
      .from('thread_messages')
      .select('*, sender:profiles!sender_id(display_name)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(m => ({ ...m, sender_name: m.sender?.display_name })));
    }
  };

  const fetchTemplates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('auto_message_templates')
      .select('*')
      .eq('kitchen_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setTemplates(data);
  };

  const markThreadAsRead = async (threadId: string) => {
    await supabase
      .from('message_threads')
      .update({ status: 'open' })
      .eq('id', threadId)
      .eq('status', 'unread');
    fetchThreads();
  };

  const sendMessage = async () => {
    if (!messageBody.trim() || !selectedThread || !user) return;

    const { error } = await supabase
      .from('thread_messages')
      .insert({
        thread_id: selectedThread,
        sender_id: user.id,
        body: messageBody,
        type: 'general',
        channel: 'in-app',
        delivery_status: 'sent'
      });

    if (!error) {
      setMessageBody('');
      fetchMessages(selectedThread);
      await supabase
        .from('message_threads')
        .update({ last_activity_at: new Date().toISOString(), status: 'open' })
        .eq('id', selectedThread);
      fetchThreads();
    }
  };

  const updateThreadStatus = async (threadId: string, status: string) => {
    await supabase
      .from('message_threads')
      .update({ status })
      .eq('id', threadId);
    fetchThreads();
  };

  const toggleTemplate = async (id: string, enabled: boolean) => {
    await supabase
      .from('auto_message_templates')
      .update({ enabled: !enabled })
      .eq('id', id);
    fetchTemplates();
  };

  const getThreadTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      customer_request: 'Förfrågan',
      customer_wish: 'Önskemål',
      order: 'Beställning',
      complaint: 'Klagomål',
      tkm_info: 'Info',
      tkm_system: 'Systeminfo',
      tkm_competition: 'Tävling',
      tkm_feedback: 'Feedback',
      tkm_personal: 'Personligt'
    };
    return labels[type] || type;
  };

  const renderMessages = () => {
    const isCustomerTab = internalTab === 'from-customers';
    const isTkmmdiTab = internalTab === 'from-tkmmdi';
    const isNewMessageTab = internalTab === 'new-message';

    const customerTypes = ['customer_request', 'customer_wish', 'order', 'complaint'];
    const tkmmdiTypes = ['tkm_info', 'tkm_system', 'tkm_competition', 'tkm_feedback', 'tkm_personal'];

    const filteredThreads = threads.filter(t => {
      if (isCustomerTab && !customerTypes.includes(t.type)) return false;
      if (isTkmmdiTab && !tkmmdiTypes.includes(t.type)) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchQuery && !t.party_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return (
      <div>
        <h2 className="font-lobster text-2xl text-gray-800 mb-6 font-bold">Meddelanden</h2>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setInternalTab('from-customers')}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: internalTab === 'from-customers' ? '#56c5c5' : '#ffffff',
              color: internalTab === 'from-customers' ? '#ffffff' : '#000000',
            }}
          >
            Från kunder
            {unreadFromCustomers > 0 && (
              <span
                className="flex items-center justify-center text-white text-xs font-bold rounded-full"
                style={{
                  backgroundColor: internalTab === 'from-customers' ? '#ffffff' : '#56c5c5',
                  color: internalTab === 'from-customers' ? '#56c5c5' : '#ffffff',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  fontSize: '11px'
                }}
              >
                {unreadFromCustomers}
              </span>
            )}
          </button>
          <button
            onClick={() => setInternalTab('from-tkmmdi')}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: internalTab === 'from-tkmmdi' ? '#56c5c5' : '#ffffff',
              color: internalTab === 'from-tkmmdi' ? '#ffffff' : '#000000',
            }}
          >
            Från TKMMDI
            {unreadFromTkmmdi > 0 && (
              <span
                className="flex items-center justify-center text-white text-xs font-bold rounded-full"
                style={{
                  backgroundColor: internalTab === 'from-tkmmdi' ? '#ffffff' : '#56c5c5',
                  color: internalTab === 'from-tkmmdi' ? '#56c5c5' : '#ffffff',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  fontSize: '11px'
                }}
              >
                {unreadFromTkmmdi}
              </span>
            )}
          </button>
          <button
            onClick={() => setInternalTab('new-message')}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: internalTab === 'new-message' ? '#56c5c5' : '#ffffff',
              color: internalTab === 'new-message' ? '#ffffff' : '#000000',
            }}
          >
            Skriv nytt meddelande
          </button>
        </div>

        {isNewMessageTab ? (
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-bold mb-4">Nytt meddelande</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mottagare</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Välj mottagare...</option>
                  <option>TKMMDI Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Typ</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Förfrågan</option>
                  <option>Önskemål</option>
                  <option>Klagomål</option>
                  <option>Annat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ämne</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meddelande</label>
                <textarea rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Paperclip size={18} />
                  Bifoga fil
                </button>
              </div>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Skicka meddelande
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Sök kund, ordernummer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Alla typer</option>
                {isCustomerTab && (
                  <>
                    <option value="customer_request">Förfrågan</option>
                    <option value="customer_wish">Önskemål</option>
                    <option value="order">Beställning</option>
                    <option value="complaint">Klagomål</option>
                  </>
                )}
                {isTkmmdiTab && (
                  <>
                    <option value="tkm_info">Info</option>
                    <option value="tkm_system">Systeminfo</option>
                    <option value="tkm_competition">Tävling</option>
                    <option value="tkm_feedback">Feedback</option>
                    <option value="tkm_personal">Personligt</option>
                  </>
                )}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Alla status</option>
                <option value="unread">Ej läst</option>
                <option value="open">Pågående</option>
                <option value="waiting_customer">Väntar på kund</option>
                <option value="waiting_cook">Väntar på kock</option>
                <option value="closed">Avslutad</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 bg-white rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <h3 className="font-bold mb-4">Konversationer</h3>
                {filteredThreads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedThread === thread.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">{thread.party_name || 'Okänd'}</span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: thread.status === 'unread' ? '#000000' :
                            thread.status === 'open' ? '#a1c798' :
                            thread.status === 'closed' ? '#9ca3af' : '#9ca3af',
                          color: thread.status === 'unread' ? '#ffffff' :
                            thread.status === 'open' ? '#000000' :
                            thread.status === 'closed' ? '#1f2937' : '#1f2937'
                        }}
                      >
                        {thread.status === 'unread' ? 'Oläst' : thread.status === 'open' ? 'Pågår' : thread.status === 'closed' ? 'Avslutad' : thread.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">{getThreadTypeLabel(thread.type)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(thread.last_activity_at).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-2 bg-white rounded-lg p-4 flex flex-col" style={{ height: '600px' }}>
                {selectedThread ? (
                  <>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <h3 className="font-bold">Konversation</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateThreadStatus(selectedThread, 'closed')}
                          className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
                        >
                          Avsluta
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.map(msg => {
                        const currentThread = threads.find(t => t.id === selectedThread);
                        const isCustomerThread = currentThread && ['customer_request', 'customer_wish', 'order', 'complaint'].includes(currentThread.type);
                        const isTkmmdiThread = currentThread && ['tkm_info', 'tkm_system', 'tkm_competition', 'tkm_feedback', 'tkm_personal'].includes(currentThread.type);

                        let isChefMessage = msg.sender_id === user?.id;

                        if (currentThread?.is_test) {
                          const messageIndex = messages.indexOf(msg);
                          isChefMessage = messageIndex % 2 === 1;
                        }

                        let senderLabel = isChefMessage ? 'Du' : 'Kund';
                        if (isTkmmdiThread && !isChefMessage) {
                          senderLabel = 'TKMMDI';
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isChefMessage ? 'items-end' : 'items-start'}`}
                          >
                            <div className="text-xs text-gray-600 mb-1">
                              {senderLabel}
                            </div>
                            <div className="max-w-[70%] rounded-lg p-3" style={{ backgroundColor: isChefMessage ? '#a1c798' : '#f6f2e0' }}>
                              <div className="text-xs text-gray-600 mb-1">
                                {new Date(msg.created_at).toLocaleString('sv-SE')}
                              </div>
                              <div className="text-sm">{msg.body}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {msg.delivery_status === 'delivered' ? 'Läst' : msg.delivery_status === 'sent' ? 'Skickat, ej läst' : msg.delivery_status}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Paperclip size={20} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Bot size={20} />
                      </button>
                      <input
                        type="text"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Skriv meddelande..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={sendMessage}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: '#a1c798' }}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Välj en konversation för att visa meddelanden
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAutoMessages = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-lobster text-2xl text-gray-800 font-bold">Automatiska meddelanden</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus size={20} />
            Ny mall
          </button>
        </div>

        <div className="bg-white rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-6">
            Skapa automatiska meddelanden som skickas vid särskilda händelser. Tillgängligt för Silver & Guld medlemmar.
          </p>

          <div className="space-y-4">
            {templates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{template.subject}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {template.trigger}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{template.body}</p>
                    <div className="flex gap-2 mt-2">
                      {template.channels.map(ch => (
                        <span key={ch} className="text-xs px-2 py-1 bg-gray-100 rounded">{ch}</span>
                      ))}
                      <span className="text-xs text-gray-500">Fördröjning: {template.delay_minutes} min</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTemplate(template.id, template.enabled)}
                      className={`px-3 py-1 text-sm rounded ${
                        template.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {template.enabled ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSandbox = () => {
    const createTestThreads = async () => {
      if (!user) return;

      try {
        const threadTypes = [
          { type: 'customer_request', name: 'Test Kund 1', messageBody: 'Hej! Jag undrar om ni kan laga glutenfri mat?' },
          { type: 'customer_wish', name: 'Test Kund 2', messageBody: 'Kan ni göra en vegansk variant av er lasagne?' },
          { type: 'order', name: 'Test Kund 3', messageBody: 'Min beställning #1234 - när kan jag hämta?' },
          { type: 'complaint', name: 'Test Kund 4', messageBody: 'Maten var inte varm när jag hämtade den.' },
          { type: 'tkm_info', name: 'TKMMDI Support', messageBody: 'Information om nya funktioner i plattformen.' },
          { type: 'tkm_system', name: 'TKMMDI System', messageBody: 'Systemunderhåll planerat till imorgon kl 02:00.' },
        ];

        for (const testThread of threadTypes) {
          const { data: thread, error: threadError } = await supabase
            .from('message_threads')
            .insert({
              party_a_id: user.id,
              party_b_id: user.id,
              type: testThread.type,
              status: 'unread',
              is_test: true,
              last_activity_at: new Date().toISOString()
            })
            .select()
            .single();

          if (threadError) {
            console.error('Error creating thread:', threadError);
            alert('Fel vid skapande av tråd: ' + threadError.message);
            return;
          }

          if (thread) {
            const { error: msgError } = await supabase
              .from('thread_messages')
              .insert({
                thread_id: thread.id,
                sender_id: user.id,
                body: testThread.messageBody,
                type: testThread.type,
                channel: 'in-app',
                delivery_status: 'delivered'
              });

            if (msgError) {
              console.error('Error creating message:', msgError);
            }
          }
        }

        alert('Testtrådar skapade! Kontrollera Meddelanden-fliken och indikatorn i menyn.');
        fetchThreads();
      } catch (error) {
        console.error('Error in createTestThreads:', error);
        alert('Ett fel uppstod: ' + (error as Error).message);
      }
    };

    const simulateCustomerMessage = async () => {
      if (!user) return;

      try {
        const { data: testThreads } = await supabase
          .from('message_threads')
          .select('id')
          .eq('is_test', true)
          .or(`party_a_id.eq.${user.id},party_b_id.eq.${user.id}`)
          .in('type', ['customer_request', 'customer_wish', 'order', 'complaint'])
          .limit(1)
          .maybeSingle();

        if (!testThreads) {
          alert('Ingen testtråd hittades. Skapa testtrådar först.');
          return;
        }

        const { error: msgError } = await supabase
          .from('thread_messages')
          .insert({
            thread_id: testThreads.id,
            sender_id: user.id,
            body: 'Tack för snabbt svar! Här är ett nytt meddelande från kunden.',
            type: 'customer_request',
            channel: 'in-app',
            delivery_status: 'delivered'
          });

        if (msgError) {
          console.error('Error creating message:', msgError);
          alert('Fel vid skapande av meddelande: ' + msgError.message);
          return;
        }

        await supabase
          .from('message_threads')
          .update({
            status: 'unread',
            last_activity_at: new Date().toISOString()
          })
          .eq('id', testThreads.id);

        alert('Simulerat kundmeddelande skickat! Indikatorn bör uppdateras.');
        fetchThreads();
      } catch (error) {
        console.error('Error in simulateCustomerMessage:', error);
        alert('Ett fel uppstod: ' + (error as Error).message);
      }
    };

    const clearTestData = async () => {
      if (!user) return;

      try {
        const { data: testThreads } = await supabase
          .from('message_threads')
          .select('id')
          .eq('is_test', true)
          .or(`party_a_id.eq.${user.id},party_b_id.eq.${user.id}`);

        if (testThreads && testThreads.length > 0) {
          const threadIds = testThreads.map(t => t.id);

          const { error: msgError } = await supabase
            .from('thread_messages')
            .delete()
            .in('thread_id', threadIds);

          if (msgError) {
            console.error('Error deleting messages:', msgError);
          }

          const { error: threadError } = await supabase
            .from('message_threads')
            .delete()
            .in('id', threadIds);

          if (threadError) {
            console.error('Error deleting threads:', threadError);
            alert('Fel vid borttagning av trådar: ' + threadError.message);
            return;
          }

          alert('All testdata har rensats!');
          fetchThreads();
        } else {
          alert('Ingen testdata att rensa.');
        }
      } catch (error) {
        console.error('Error in clearTestData:', error);
        alert('Ett fel uppstod: ' + (error as Error).message);
      }
    };

    return (
      <div>
        <h2 className="font-lobster text-2xl text-gray-800 mb-6 font-bold">Sandbox (endast test)</h2>

        <div className="bg-white rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-6">
            Denna sandbox används för att testa kommunikationssystemet innan kund- och adminpanel är byggda.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">1. Skapa testtrådar</h3>
              <p className="text-sm text-gray-600 mb-3">
                Skapar exempeltrådar (Förfrågan, Önskemål, Beställning, Klagomål, TKMMDI-meddelanden) med olästa meddelanden.
              </p>
              <button
                onClick={createTestThreads}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Skapa testtrådar
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">2. Simulera kundmeddelande</h3>
              <p className="text-sm text-gray-600 mb-3">
                Lägger till ett nytt inkommande meddelande i en befintlig kundtråd för att testa realtidsuppdatering.
              </p>
              <button
                onClick={simulateCustomerMessage}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Simulera kundmeddelande
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">3. Rensa testdata</h3>
              <p className="text-sm text-gray-600 mb-3">
                Tar bort alla trådar och meddelanden som skapats i sandbox-läget (markerade med is_test=true).
              </p>
              <button
                onClick={clearTestData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Rensa testdata
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">Vad testas:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✓ Chattlayouten fungerar korrekt</li>
              <li>✓ Turkosa indikatorn (#56c5c5) uppdateras i realtid</li>
              <li>✓ Olästa meddelanden markeras som lästa vid öppning</li>
              <li>✓ Antalsräknare på flikarna "Från kunder" och "Från TKMMDI"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'messages':
        return renderMessages();
      case 'auto-messages':
        return renderAutoMessages();
      case 'sandbox':
        return renderSandbox();
      default:
        return (
          <div>
            <h2 className="font-lobster text-2xl text-gray-800 mb-4 font-bold">Kommunikation</h2>
            <p className="text-gray-600">Välj en undermeny till vänster</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#f6f2e0' }}>
        {renderContent()}
      </div>
    </div>
  );
};
