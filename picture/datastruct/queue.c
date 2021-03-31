
#define QUEUE_SIZE 100

static int queue[QUEUE_SIZE];
static int front = 0;
static int tail = 0;

void enqueue(int i){
	queue[tail++] = i;
	if(tail >= QUEUE_SIZE)
		tail = 0;
}

int dequeue(){
	front++;
	if (front >= QUEUE_SIZE) {
		front = 0;
	}
	return queue[front-1];
}






